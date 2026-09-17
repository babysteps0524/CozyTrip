export {
  destinations,
  destinationMap,
  getDestinationById,
  getDestinationBySlug,
} from "./destinations";

export {
  hotels,
  hotelMap,
  getHotelById,
  getHotelBySlug,
  getHotelsByCity,
  getHotelsByDestination,
} from "./hotels";

export {
  posts,
  postMap,
  getPostById,
  getPostBySlug,
  getPostsByCategory,
  getPostsByDestination,
  getPostsByHotel,
  getHotelPostByHotel,
} from "./posts";

export {
  images,
  imageMap,
  getImageById,
  getImagesByHotelId,
  getImagesByType,
  getConfirmedImages,
} from "./images";
