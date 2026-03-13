import { useQuery } from "react-query";
import { getHavenProperties } from "../utils/api";
import { STATIC_PROPERTIES } from "../data/properties";

/**
 * Fetches properties from the HAVEN Mongoose API (/api/properties).
 * Falls back to static data if the API is unreachable.
 */
const useHavenProperties = (filters = {}) => {
    const cacheKey = ["havenProperties", JSON.stringify(filters)];

    const { data, isLoading, isError, error, refetch } = useQuery(
        cacheKey,
        () => getHavenProperties(filters),
        {
            refetchOnWindowFocus: false,
            retry: 1,
            // If API fails, return static data rather than crashing
            onError: () => { },
        }
    );

    // Normalise API response shape (paginated or plain array)
    const rawList = data?.data || data || null;

    // Fall back to static properties if API unreachable
    const properties = Array.isArray(rawList) && rawList.length > 0
        ? rawList
        : (isError ? STATIC_PROPERTIES : rawList);

    const usingFallback = isError || (!isLoading && (!rawList || rawList.length === 0));

    // Map API properties to the shape components expect
    const normalised = (properties || STATIC_PROPERTIES).map((p) => {
        // Feature 2: Determine listing image. If hero is video/youtube, use a photo fallback instead.
        const isVideoHero = p.media?.heroMediaType === "video" || p.media?.heroMediaType === "youtube";
        const imageFallback = p.media?.coverImage || p.media?.photos?.[0] || p.image || "";
        const defaultImage = p.media?.coverImage || p.image || p.media?.photos?.[0] || "";
        
        return {
            ...p,
            id: p._id || p.id || p.slug,
            image: defaultImage,
            listingImage: isVideoHero ? imageFallback : defaultImage,
            city: p.location?.city || p.city || "",
            country: p.location?.country || p.country || "",
            address: p.location?.address || p.address || "",
        price: typeof p.price === "object" ? (p.price?.amount ?? p.price) : p.price,
        priceObj: typeof p.price === "object" ? p.price : { amount: p.price, currency: "INR", priceType: "for-sale" },
        facilities: {
            bedrooms: p.details?.bedrooms || p.facilities?.bedrooms || 0,
            bathrooms: p.details?.bathrooms || p.facilities?.bathrooms || 0,
            parking: p.details?.parking || p.facilities?.parking || p.facilities?.parkings || 0,
            squareFeet: p.details?.squareFeet || 0,
        },
        type: p.type || "apartment",
        status: p.status || "for-sale",
        featured: p.featured || false,
        neighborhood: p.location?.neighborhood || "",
        amenities: p.amenities || [],
        photos: p.media?.photos || [],
        agent: p.agent || {},
        shortDescription: p.description?.short || p.description || "",
        fullDescription: p.description?.full || p.description || "",
    };
    });

    return {
        data: normalised,
        isLoading: isLoading && !usingFallback,
        isError: false, // We always return something
        usingFallback,
        refetch,
    };
};

export default useHavenProperties;
