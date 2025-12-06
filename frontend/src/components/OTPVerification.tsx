// This component is no longer needed as OTP authentication has been removed
// Keeping file for backward compatibility but marking as deprecated

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OTPVerification() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>OTP Verification Deprecated</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 text-center">
        <div className="text-muted-foreground">
          OTP verification has been removed. Please use the new simplified signup process.
        </div>
      </CardContent>
    </Card>
  );
}
