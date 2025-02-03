import { useRouter, usePathname } from "next/navigation";

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const goBack = () => {
    router.back();
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const isActiveParent = (path: string) => {
    return pathname.startsWith(path);
  };

  return {
    navigateTo,
    goBack,
    isActive,
    isActiveParent,
    currentPath: pathname,
  };
}
