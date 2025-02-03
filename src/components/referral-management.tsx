"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";

interface ReferralManagementProps {
  referralCode: string;
}

export function ReferralManagement({ referralCode }: ReferralManagementProps) {
  const handleShare = () => {
    console.log("Sharing code:", referralCode);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>הזמן חברים</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">קוד הזמנה</div>
          <div className="mt-1 text-2xl font-bold">{referralCode}</div>
        </div>
        <Button className="w-full" onClick={handleShare}>
          <Share className="mr-2 h-4 w-4" />
          שתף קוד הזמנה
        </Button>
      </CardContent>
    </Card>
  );
}
