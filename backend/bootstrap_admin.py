"""
Bootstrap: create the first Super Admin account.
Run once from backend directory:
  python3 bootstrap_admin.py
"""
import asyncio, os, getpass, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

from database import get_pool, init_db, close_pool
from auth import hash_password


async def main():
    print("=== Rytspot Admin Bootstrap ===\n")
    await init_db()
    pool = await get_pool()

    async with pool.acquire() as conn:
        existing = await conn.fetchval("SELECT COUNT(*) FROM admins")
        if existing > 0:
            print(f"Warning: {existing} admin(s) already exist.")
            confirm = input("Continue anyway? (y/N): ").strip().lower()
            if confirm != "y":
                print("Aborted.")
                await close_pool()
                return

    name  = input("Admin name: ").strip()
    phone = input("Phone (optional, press Enter to skip): ").strip() or None
    email = input("Email (optional, press Enter to skip): ").strip() or None
    if not phone and not email:
        print("Error: at least phone or email is required.")
        await close_pool()
        return
    pw = getpass.getpass("Password: ")
    if len(pw) < 6:
        print("Error: password must be at least 6 characters.")
        await close_pool()
        return
    pw2 = getpass.getpass("Confirm password: ")
    if pw != pw2:
        print("Error: passwords do not match.")
        await close_pool()
        return

    pw_hash = hash_password(pw)
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """INSERT INTO admins (name, phone, email, password_hash, role)
               VALUES ($1, $2, $3, $4, 'super_admin') RETURNING id, name, role""",
            name, phone, email, pw_hash
        )

    print(f"\n✓ Super Admin created successfully!")
    print(f"  Name: {row['name']}")
    print(f"  ID:   {row['id']}")
    print(f"  Role: {row['role']}")
    print(f"\nLogin at: /admin/login")
    await close_pool()


if __name__ == "__main__":
    asyncio.run(main())
