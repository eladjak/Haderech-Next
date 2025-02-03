import Link from "next/link";

export function MainNav() {
  return (
    <div className="mr-4 flex">
      <Link href="/" className="flex items-center space-x-2 space-x-reverse">
        <span className="inline-block font-bold">הדרך</span>
      </Link>
    </div>
  );
}
