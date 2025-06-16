
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import { useAuth } from "./AuthProvider";
import { BirthdayNotifications } from "./BirthdayNotifications";

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <div className="flex items-center gap-4">
          {user && <BirthdayNotifications />}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
