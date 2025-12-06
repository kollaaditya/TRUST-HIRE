import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LocationDetectorProps {
  onLocationDetected: (location: string) => void;
  className?: string;
}

export const LocationDetector = ({ onLocationDetected, className }: LocationDetectorProps) => {
  const [detecting, setDetecting] = useState(false);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use reverse geocoding to get location name
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          
          const data = await response.json();
          const location = data.address.city || data.address.town || data.address.village || data.address.state || "Unknown Location";
          
          onLocationDetected(location);
          toast.success(`Location detected: ${location}`);
        } catch (error) {
          toast.error("Failed to get location name");
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        setDetecting(false);
        toast.error("Failed to detect location: " + error.message);
      }
    );
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={detectLocation}
      disabled={detecting}
      className={className}
    >
      {detecting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <MapPin className="w-4 h-4 mr-2" />
      )}
      {detecting ? "Detecting..." : "Detect Location"}
    </Button>
  );
};
