
import { Sun, Cloud, CloudSun, CloudRain, Cloudy, CloudFog, CloudLightning, CloudDrizzle, CloudHail, Snowflake, ThumbsUp } from "lucide-react";
import type { LucideProps } from "lucide-react";

interface WeatherIconProps extends LucideProps {
  code: number;
}

/**
 * WMO Weather interpretation codes (WW)
 * Code Description
 * 0    Clear sky
 * 1, 2, 3  Mainly clear, partly cloudy, and overcast
 * 45, 48   Fog and depositing rime fog
 * 51, 53, 55   Drizzle: Light, moderate, and dense intensity
 * 56, 57   Freezing Drizzle: Light and dense intensity
 * 61, 63, 65   Rain: Slight, moderate and heavy intensity
 * 66, 67   Freezing Rain: Light and heavy intensity
 * 71, 73, 75   Snow fall: Slight, moderate, and heavy intensity
 * 77   Snow grains
 * 80, 81, 82   Rain showers: Slight, moderate, and violent
 * 85, 86   Snow showers slight and heavy
 * 95 *   Thunderstorm: Slight or moderate
 * 96, 99 *   Thunderstorm with slight and heavy hail
 */
export default function WeatherIcon({ code, ...props }: WeatherIconProps) {
  switch (code) {
    case 0:
      return <Sun {...props} />;
    case 1:
      return <CloudSun {...props} />;
    case 2:
      return <Cloud {...props} />;
    case 3:
      return <Cloudy {...props} />;
    case 45:
    case 48:
      return <CloudFog {...props} />;
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return <CloudDrizzle {...props} />;
    case 61:
    case 63:
    case 65:
    case 80:
    case 81:
    case 82:
      return <CloudRain {...props} />;
    case 66:
    case 67:
        return <CloudRain {...props} />; // Freezing rain, use rain icon
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return <Snowflake {...props} />;
    case 95:
      return <CloudLightning {...props} />;
    case 96:
    case 99:
      return <CloudHail {...props} />;
    default:
      return <ThumbsUp {...props} />;
  }
}
