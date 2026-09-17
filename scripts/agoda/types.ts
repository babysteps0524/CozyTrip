export interface AgodaCity {
  cityId: string;
  countryId: string;
  cityName: string;
  cityTranslated?: string;
  activeHotels?: string;
  longitude?: number;
  latitude?: number;
  noArea?: string;
}

export interface AgodaCityResponse {
  cityFeed?: {
    cities?: {
      city?: AgodaCity[];
    };
  };
}

export interface AgodaHotelInformation {
  hotelId: string;
  hotelName: string;
  hotelFormerlyName?: string;
  translatedName?: string;

  starRating?: number;

  continentId?: string;
  countryId?: string;
  cityId?: string;
  areaId?: string;

  longitude?: number;
  latitude?: number;

  hotelUrl?: string;

  popularityScore?: number;

  phoneNo?: string;

  remark?: string;

  numberOfReviews?: number;

  ratingAverage?: number;

  childAndExtrabedPolicy?: {
    infantAge?: string;
    childrenAgeFrom?: string;
    childrenAgeTo?: string;
    childrenStayFree?: string;
    minGuestAge?: string;
  };

  accommodationType?: string;

  nationalityRestrictions?: string;

  singleRoomProperty?: boolean;
}

export interface AgodaHotelInformationResponse {
  hotelInformationFeed?: {
    hotelInformations?: {
      hotelInformation?: AgodaHotelInformation[];
    };
  };
}

export interface AgodaHotelPicture {
  hotelId: string;
  pictureId: string;
  caption?: string;
  captionTranslated?: string;
  URL: string;
  pictureGroup?: string;
}

export interface AgodaHotelPictureResponse {
  pictureFeed?: {
    pictures?: {
      picture?: AgodaHotelPicture[];
    };
  };
}

export interface AgodaHotelFacility {
  hotelId: string;
  propertyId?: string;
  propertyGroupDescription?: string;
  propertyName?: string;
  propertyTranslatedName?: string;
}

export interface AgodaHotelFacilityResponse {
  facilityFeed?: {
    facilities?: {
      facility?: AgodaHotelFacility[];
    };
  };
}

export interface AgodaHotelRoomType {
  hotelId: string;

  hotelRoomtypeId: string;

  standardCaption?: string;
  standardCaptionTranslated?: string;

  maxOccupancyPerRoom?: number;

  noOfRoom?: number;

  sizeOfRoom?: number;

  roomSizeInclTerrace?: boolean;

  views?: string;

  maxExtrabeds?: number;

  maxInfantInRoom?: number;

  hotelRoomtypePicture?: string;

  hotelRoomtypePictures?: string[];

  bedType?: string;

  hotelMasterRoomtypeId?: string;

  hotelRoomtypeAlternateName?: string;

  sharedBathroom?: boolean;

  gender?: string;
}

export interface AgodaRoomTypeResponse {
  roomtypeFeed?: {
    roomtypes?: {
      roomtypes?: AgodaHotelRoomType[];
    };
  };
}

export interface AgodaHotelInfo {
  hotelId: string;

  propertyId?: string;

  propertyName?: string;

  propertyTranslatedName?: string;

  propertyDetails?: string;
}

export interface AgodaHotelInfoResponse {
  hotelInfoFeed?: {
    hotelInfos?: {
      hotelInfo?: AgodaHotelInfo[];
    };
  };
}

export interface AgodaHotelDescription {
  hotelId: string;

  overview?: string;

  snippet?: string;
}

export interface AgodaHotelDescriptionResponse {
  hotelDescriptionFeed?: {
    hotelDescriptions?: {
      hotelDescription?: AgodaHotelDescription[];
    };
  };
}

export interface AgodaHotelAddress {
  hotelId: string;

  addressType?: string;

  addressLine1?: string;

  addressLine2?: string;

  postalCode?: string;

  state?: string;

  city?: string;

  country?: string;
}

export interface AgodaHotelAddressResponse {
  hotelAddressFeed?: {
    hotelAddresses?: {
      hotelAddress?: AgodaHotelAddress[];
    };
  };
}

/**
 * Feed 19
 * Full Hotel Information
 */

export interface AgodaFullHotel {
  hotelId: string;

  hotelName: string;

  hotelFormerlyName?: string;

  translatedName?: string;

  starRating?: number;

  continentId?: string;

  countryId?: string;

  cityId?: string;

  areaId?: string;

  longitude?: number;

  latitude?: number;

  hotelUrl?: string;

  popularityScore?: number;

  remark?: string;

  numberOfReviews?: number;

  ratingAverage?: number;

  childAndExtrabedPolicy?: {
    infantAge?: string;
    childrenAgeFrom?: string;
    childrenAgeTo?: string;
    childrenStayFree?: string;
    minGuestAge?: string;
  };

  accommodationType?: string;

  nationalityRestrictions?: string;

  singleRoomProperty?: boolean;

  taxId?: string;

  ownerId?: string;

  ownerName?: string;
}

export interface AgodaFullAddress {
  hotelId: string;

  addressType?: string;

  addressLine1?: string;

  addressLine2?: string;

  postalCode?: string;

  state?: string;

  city?: string;

  country?: string;
}

export interface AgodaFullDescription {
  hotelId: string;

  overview?: string;

  snippet?: string;
}

export interface AgodaFullFacility {
  hotelId: string;

  propertyGroupDescription?: string;

  propertyId?: string;

  propertyName?: string;

  propertyTranslatedName?: string;
}

export interface AgodaFullPicture {
  hotelId: string;

  pictureId?: string;

  caption?: string;

  captionTranslated?: string;

  URL?: string;

  pictureGroup?: string;
}

export interface AgodaFullRoomType {
  hotelId: string;

  hotelRoomtypeId?: string;

  standardCaption?: string;

  standardCaptionTranslated?: string;

  maxOccupancyPerRoom?: number;

  noOfRoom?: number;

  sizeOfRoom?: number;

  roomSizeInclTerrace?: boolean;

  views?: string;

  maxExtrabeds?: number;

  maxInfantInRoom?: number;

  hotelRoomtypePicture?: string;

  hotelRoomtypePictures?: string[];

  bedType?: string;

  hotelMasterRoomtypeId?: string;

  hotelRoomtypeAlternateName?: string;

  sharedBathroom?: boolean;

  gender?: string;
}

export interface AgodaHotelFullInformationResponse {
  hotelFullFeed?: {
    hotels?: {
      hotel?: AgodaFullHotel[];
    };

    addresses?: {
      address?: AgodaFullAddress[];
    };

    descriptions?: {
      description?: AgodaFullDescription[];
    };

    facilities?: {
      facility?: AgodaFullFacility[];
    };

    pictures?: {
      picture?: AgodaFullPicture[];
    };

    roomtypes?: {
      roomtype?: AgodaFullRoomType[];
    };
  };
}
