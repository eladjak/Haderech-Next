import { Share } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/";\nimport { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


interface ReferralManagementProps {
  referralCode: string;
  onShare: () => void;
}

export function ReferralManagement({
  referralCode,
  onShare,
}: ReferralManagementProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>הזמן חברים</CardTitle>
        <CardDescription>
          שתף את קוד ההזמנה שלך וקבל הטבות מיוחדות כשחברים מצטרפים
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input value={referralCode} readOnly className="font-mono" />
          <Button variant="outline" size="icon" onClick={onShare}>
            <Share className="h-4 w-4" />
            <span className="sr-only">שתף קוד הזמנה</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
