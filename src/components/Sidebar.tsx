import Link from "next/link";
import { Home, Image, Send, GitCompare, Coins } from "lucide-react";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "NFT", href: "/nft", icon: Image },
  { name: "Send", href: "/send", icon: Send },
  { name: "Bridge", href: "/bridge", icon: GitCompare },
  { name: "Tokens", href: "/tokens", icon: Coins },
  { name: "Buy ENS", href: "/ens", icon: Coins },
];

export default function Sidebar() {
  return (
    <div className="theme-custom bg-background text-foreground w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <nav>
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-accent hover:text-accent-foreground"
          >
            <item.icon className="inline-block mr-2 h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
