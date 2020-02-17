import PlantDataImg from "../../entity/PlantDataImg";
import API from "../../entity/API";

declare namespace entity {
  interface userType {
    image?: string;
    username?: string;
  }

  interface plantsDatabaseType {
    distributionName: string;
    scientificName?: string;
    englishName?: string;
    contentsNo: number;
    images?: PlantDataImg[];
    tmpImages?: string[];
  }
  interface apiType {
    provider: string;
    url: string;
  }
}

export = entity;