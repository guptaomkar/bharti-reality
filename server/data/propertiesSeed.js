// Enriched static property seed data — used both for seeding MongoDB and as frontend fallback
export const STATIC_PROPERTIES = [
    {
        title: "Obsidian Sky Penthouse",
        status: "for-sale",
        featured: true,
        type: "penthouse",
        category: "luxury",
        price: { amount: 18500000, currency: "INR", priceType: "for-sale" },
        location: {
            address: "One57, 157 West 57th Street, Unit PH-A",
            city: "New York",
            state: "NY",
            country: "US",
            zipCode: "10019",
            neighborhood: "Midtown Manhattan",
        },
        details: {
            bedrooms: 5, bathrooms: 5, halfBaths: 1,
            squareFeet: 6840, floors: 1, yearBuilt: 2014,
            parking: 2, garage: true, pool: false, furnished: true,
        },
        description: {
            short: "A crown jewel above Central Park — panoramic floor-to-ceiling glass, bespoke finishes, and the city skyline as your canvas.",
            full: `Perched on the 89th floor of One57, the most coveted residential address in New York City, this extraordinary penthouse redefines what it means to live above the world. Floor-to-ceiling glass spans every room, framing unobstructed views of Central Park, the Hudson River, and the Manhattan skyline in every direction.

The interiors were conceived by a Pritzker-winning architecture firm: walls of hand-selected Calacatta marble, bespoke millwork in fumed white oak, and a great room of over 2,400 square feet that flows seamlessly from living to dining to a chef's kitchen equipped with La Cornue ranges and Sub-Zero refrigeration.

Five bedroom suites — each a private sanctum with en-suite bath, motorized blackout shading, and custom walk-in wardrobes — offer unparalleled repose above the city's ceaseless rhythm. Building amenities include a 60-foot pool, private cinema, sommelier wine cellar, and 24-hour white-glove concierge that anticipates your every need before you think of it.`,
        },
        amenities: ["Concierge", "Private Cinema", "Wine Cellar", "Pool", "Fitness Center", "Valet Parking", "Terrace", "Smart Home", "Wine Room", "Spa"],
        media: {
            coverImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=85",
            photos: [
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=85",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=85",
                "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=85",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=85",
                "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&q=85",
            ],
        },
        agent: { name: "Isabelle Moreau", phone: "+1 212 555 0192", email: "i.moreau@haven.com", license: "NY-RE-00294" },
        userEmail: "admin@haven.com",
    },
    {
        title: "Azure Cliffs Beachfront Villa",
        status: "for-sale",
        featured: true,
        type: "villa",
        category: "luxury",
        price: { amount: 24800000, currency: "INR", priceType: "for-sale" },
        location: {
            address: "3 Millionaire's Row, Malibu",
            city: "Los Angeles",
            state: "CA",
            country: "US",
            zipCode: "90265",
            neighborhood: "Malibu Colony",
        },
        details: {
            bedrooms: 7, bathrooms: 8, halfBaths: 2,
            squareFeet: 11400, lotSize: 28000, floors: 3, yearBuilt: 2021,
            parking: 6, garage: true, pool: true, furnished: true,
        },
        description: {
            short: "Where the Pacific meets architecture — 200 feet of private beachfront, an infinity pool cascading toward the ocean, and interiors that blur the line between inside and out.",
            full: `A singular statement of coastal luxury set directly on the sands of Malibu Colony, Azure Cliffs spans three levels of open, light-drenched living across 11,400 square feet. The estate commands 200 feet of private beach frontage — among the most coveted stretches of coastline on the California Riviera.

The ground floor dissolves boundary between interior and exterior through floor-to-ceiling sliding glass disappearing walls, exposing a great living pavilion, gallery-ready dining room, and a chef's kitchen to the sea air. An infinity pool extends the visual axis of the ocean, while a lower terrace hot tub and fire pit create an intimate retreat as the Malibu sun sets.

Seven bedroom suites — including a 3,200-square-foot primary wing with dual dressing rooms, ocean-view soaking tub, and steam room — offer sanctuary from the world. A separate guest house with private entrance, four-car climate-controlled garage, home cinema, and a rooftop garden terrace round out this once-in-a-generation offering.`,
        },
        amenities: ["Private Beach", "Infinity Pool", "Hot Tub", "Fire Pit", "Home Cinema", "Rooftop Terrace", "Guest House", "Wine Cellar", "Gym", "Smart Home", "6-Car Garage"],
        media: {
            coverImage: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=85",
            photos: [
                "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=85",
                "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=85",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85",
                "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=85",
                "https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=1200&q=85",
            ],
        },
        agent: { name: "Marcus Vidal", phone: "+1 310 555 0841", email: "m.vidal@haven.com", license: "CA-DRE-01993847" },
        userEmail: "admin@haven.com",
    },
    {
        title: "Soho Iron Loft",
        status: "for-sale",
        featured: true,
        type: "loft",
        category: "urban",
        price: { amount: 5250000, currency: "INR", priceType: "for-sale" },
        location: {
            address: "136 Wooster Street, Loft 4E",
            city: "New York",
            state: "NY",
            country: "US",
            zipCode: "10012",
            neighborhood: "SoHo",
        },
        details: {
            bedrooms: 3, bathrooms: 3, halfBaths: 0,
            squareFeet: 3800, floors: 1, yearBuilt: 1887,
            parking: 0, garage: false, pool: false, furnished: false,
        },
        description: {
            short: "A full-floor SoHo cast-iron loft with 14-foot ceilings, original columns, and artist-grade light pouring through south-facing windows.",
            full: `In the cast-iron heart of SoHo — one of New York's last true manufacturing lofts, converted with extraordinary architectural restraint — this 3,800-square-foot full-floor residence honors 135 years of history while delivering every modern refinement.

Fourteen-foot ceilings anchored by original cast-iron columns define a vast open living plane. South-facing windows — 12 of them, spanning floor to near-ceiling — flood the space with the clear, directional light that drew artists to SoHo generations ago. The kitchen is a working chef's statement: honed Pietra Serena marble, a 60-inch La Cornue Château range and hand-hammered copper hood.

Three generous bedroom suites occupy the building's quieter north side, each with custom millwork and spa-caliber baths in hand-laid Venetian tile. A private keyed elevator opens directly into the apartment. Steps from the city's finest dining, galleries, and boutiques — an address that needs no explanation.`,
        },
        amenities: ["Private Elevator", "Exposed Brick", "Original Columns", "Chef's Kitchen", "South-Facing Windows", "Keyed Entry", "Storage Unit"],
        media: {
            coverImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=85",
            photos: [
                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=85",
                "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=85",
                "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=85",
                "https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=1200&q=85",
            ],
        },
        agent: { name: "Sophia Chen", phone: "+1 212 555 0374", email: "s.chen@haven.com", license: "NY-RE-00571" },
        userEmail: "admin@haven.com",
    },
    {
        title: "Bel-Air Grand Mansion",
        status: "for-sale",
        featured: true,
        type: "mansion",
        category: "luxury",
        price: { amount: 42000000, currency: "INR", priceType: "for-sale" },
        location: {
            address: "1200 Stone Canyon Road",
            city: "Los Angeles",
            state: "CA",
            country: "US",
            zipCode: "90077",
            neighborhood: "Bel-Air",
        },
        details: {
            bedrooms: 9, bathrooms: 11, halfBaths: 2,
            squareFeet: 18600, lotSize: 87120, floors: 4, yearBuilt: 2019,
            parking: 10, garage: true, pool: true, furnished: true,
        },
        description: {
            short: "A trophy Bel-Air estate commanding two canyon-view acres — helicopter pad, negative-edge pool, full-scale nightclub, and impeccable grounds curated for entertaining at civilisation-defining scale.",
            full: `The most coveted real estate zip code on earth is Bel-Air — and within it, this masterwork stands unchallenged. Set behind two sets of private security gates on over two canyon-facing acres, the property announces itself through a 300-foot illuminated driveway framed by mature olive trees and hand-set limestone walls.

Eighteen thousand six hundred square feet of living space unfolds across four floors connected by a six-stop elevator. Formal and informal living pavilions flow through retractable glass walls to terraces, manicured lawns, and a 120-foot negative-edge pool that appears to float over the canyon. A full professional kitchen serves the estate's dining room (capacity: 40), a separate caterers' kitchen, and a 12-seat private cinema.

Nine bedroom suites, a 3,400-square-foot primary suite with dual closets the size of boutique shops, a dedicated nightclub with soundproofing and a recording studio, a two-lane indoor bowling alley, and a 10-car collector's garage complete a residence that exists at the absolute summit of human habitation.`,
        },
        amenities: ["Helicopter Pad", "Negative-Edge Pool", "Nightclub", "Recording Studio", "Bowling Alley", "Private Cinema", "10-Car Garage", "Staff Quarters", "Tennis Court", "Gym", "Wine Cellar", "Smart Home"],
        media: {
            coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85",
            photos: [
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85",
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85",
                "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1200&q=85",
                "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=1200&q=85",
                "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=1200&q=85",
            ],
        },
        agent: { name: "André Laurent", phone: "+1 310 555 0003", email: "a.laurent@haven.com", license: "CA-DRE-02114492" },
        userEmail: "admin@haven.com",
    },
    {
        title: "Chelsea Garden Townhouse",
        status: "for-sale",
        featured: false,
        type: "townhouse",
        category: "residential",
        price: { amount: 7800000, currency: "INR", priceType: "for-sale" },
        location: {
            address: "421 West 24th Street",
            city: "New York",
            state: "NY",
            country: "US",
            zipCode: "10011",
            neighborhood: "Chelsea",
        },
        details: {
            bedrooms: 5, bathrooms: 4, halfBaths: 1,
            squareFeet: 5100, lotSize: 3400, floors: 4, yearBuilt: 1895,
            parking: 0, garage: false, pool: false, furnished: false,
        },
        description: {
            short: "A landmarked brownstone townhouse on Chelsea's most sought-after block — 25-foot-wide, four stories, with a 1,200-square-foot private English garden.",
            full: `On the most celebrated block in Chelsea — designated a New York City landmark in its own right — this 25-foot-wide brownstone townhouse delivers what very few Manhattan properties can: breathing room. Built in 1895 and meticulously restored over a three-year renovation concluded in 2022, every original feature was preserved while all systems, finishes, and technology were brought to the most exacting contemporary standard.

The parlor floor features 11-foot ceilings, south-facing bay windows, original Minton tile fireplace surrounds, and a dining room that opens through bifold glass doors to the garden. The kitchen occupies the full rear ground floor with its own Garden Room dining area, a Wolf range, and direct access to the 1,200-square-foot private English garden planted with mature boxwoods, climbing roses, and white jasmine.

Above, four additional bedroom floors include a primary suite with a separate dressing room and bath framing garden views. The roof is a private planted terrace. A rare, fully self-contained garden-level studio provides income potential or perfect guest accommodation. This is London's finest offered in Manhattan's most coveted art district.`,
        },
        amenities: ["Private Garden", "Roof Terrace", "Garden Studio", "Original Fireplaces", "Basement Storage", "Smart Home", "Security System"],
        media: {
            coverImage: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=85",
            photos: [
                "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=85",
                "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=85",
                "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=1200&q=85",
                "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=85",
            ],
        },
        agent: { name: "Isabelle Moreau", phone: "+1 212 555 0192", email: "i.moreau@haven.com", license: "NY-RE-00294" },
        userEmail: "admin@haven.com",
    },
    {
        title: "Pacific Heights Edwardian Estate",
        status: "for-sale",
        featured: false,
        type: "estate",
        category: "luxury",
        price: { amount: 14200000, currency: "INR", priceType: "for-sale" },
        location: {
            address: "2960 Broadway Street",
            city: "San Francisco",
            state: "CA",
            country: "US",
            zipCode: "94115",
            neighborhood: "Pacific Heights",
        },
        details: {
            bedrooms: 7, bathrooms: 7, halfBaths: 1,
            squareFeet: 8900, lotSize: 9600, floors: 4, yearBuilt: 1908,
            parking: 3, garage: true, pool: false, furnished: false,
        },
        description: {
            short: "A grand Pacific Heights Edwardian estate with Bay views, period detailing of unapproachable quality, and modern systems discreetly integrated behind every original surface.",
            full: `On the premier residential street of San Francisco's Pacific Heights — historically the exclusive enclave of the city's founding families — this 1908 Edwardian estate stands as a monument to a golden era of American domestic architecture. Its extraordinary provenance, meticulous restoration, and commanding Bay views make it among the most significant properties available in Northern California.

Eight thousand nine hundred square feet across four levels begin with a pedimented porte-cochère entry opening onto a formal entrance hall of extraordinary volume: 14-foot coffered ceilings, a curved staircase of hand-turned balusters ascending to a stained-glass skylight, and original parquet flooring of five hardwood species laid in a geometric herringbone. Original pocket doors divide formal and informal rooms with gracious precision.

All seven bedroom suites offer original fireplace and period plasterwork detailing. The formal garden — a private urban park of Japanese maples, camellias, and agapanthus — occupies a rare 9,600-square-foot lot. A fully equipped three-car brick garage and separate staff quarters with independent access complete this irreplaceable canvas.`,
        },
        amenities: ["Bay Views", "Period Detailing", "Formal Garden", "3-Car Garage", "Staff Quarters", "Wine Cellar", "Library", "Smart Systems"],
        media: {
            coverImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85",
            photos: [
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85",
                "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=85",
                "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=85",
                "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1200&q=85",
            ],
        },
        agent: { name: "Marcus Vidal", phone: "+1 310 555 0841", email: "m.vidal@haven.com", license: "CA-DRE-01993847" },
        userEmail: "admin@haven.com",
    },
    {
        title: "Tribeca Cast-Iron Apartment",
        status: "for-rent",
        featured: false,
        type: "apartment",
        category: "urban",
        price: { amount: 32000, currency: "INR", priceType: "for-rent" },
        location: {
            address: "55 Hudson Yards, Apartment 48A",
            city: "New York",
            state: "NY",
            country: "US",
            zipCode: "10001",
            neighborhood: "Hudson Yards",
        },
        details: {
            bedrooms: 3, bathrooms: 3, halfBaths: 1,
            squareFeet: 2950, yearBuilt: 2022,
            parking: 1, garage: true, pool: true, furnished: true,
        },
        description: {
            short: "Full-floor corner residence in Hudson Yards' most iconic tower — panoramic river and city views, fully furnished with curated design, available for immediate occupancy.",
            full: `At the apex of New York's most ambitious urban development, 55 Hudson Yards rises above the High Line, the Hudson River, and the city's newest cultural institutions. This full-floor corner residence occupies the 48th floor, commanding 270-degree views from the Statue of Liberty to the Midtown skyline to the Hudson Palisades across the river.

Fully furnished by a noted interior designer in a considered palette of linen, warm oak, and antiqued brass, the residence requires nothing — simply arrive. The open kitchen features Gaggenau appliances and a breakfast island seating four. The primary suite's bath is clad in book-matched Calacatta Oro marble with a free-standing soaking tub.

Building amenities rival any five-star hotel: a 75-foot sky pool, fitness center, golf simulator, screening room, private dining with sommelier, and concierge services that extend beyond the building to the city and globe. Available furnished for a 12-month minimum lease.`,
        },
        amenities: ["Sky Pool", "Golf Simulator", "Screening Room", "Concierge", "Gym", "Private Dining", "Valet", "Smart Home", "Furnished"],
        media: {
            coverImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=85",
            photos: [
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=85",
                "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=85",
                "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=85",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=85",
            ],
        },
        agent: { name: "Sophia Chen", phone: "+1 212 555 0374", email: "s.chen@haven.com", license: "NY-RE-00571" },
        userEmail: "admin@haven.com",
    },
    {
        title: "Aspen Ridge Mountain Chalet",
        status: "for-sale",
        featured: false,
        type: "chalet",
        category: "resort",
        price: { amount: 16500000, currency: "INR", priceType: "for-sale" },
        location: {
            address: "700 Roaring Fork Road",
            city: "Aspen",
            state: "CO",
            country: "US",
            zipCode: "81611",
            neighborhood: "Roaring Fork",
        },
        details: {
            bedrooms: 6, bathrooms: 7, halfBaths: 1,
            squareFeet: 8200, lotSize: 43560, floors: 3, yearBuilt: 2018,
            parking: 4, garage: true, pool: true, furnished: true,
        },
        description: {
            short: "A ski-in/ski-out mountain retreat at the foot of Aspen Mountain — reclaimed timbers, heated stone terraces, and an outdoor hot tub overlooking the Elk Mountain Range.",
            full: `Directly at the base of Aspen Mountain's Ruthie's Run — among the most coveted ski access points in the American West — this custom mountain chalet redefines alpine luxury with a design vocabulary that honors the Rocky Mountain landscape while delivering every conceivable amenity.

Reclaimed Douglas fir timbers sourced from 19th-century Colorado homesteads form the structural and aesthetic core of the home, paired with floor-to-ceiling glass walls that frame the Elk Mountain Range as living art. The great room centers on a 14-foot double-sided stone fireplace; clerestory windows above collect light across all seasons. Radiant heat runs beneath every interior floor and exterior stone surface, including the 1,200-square-foot terrace.

Six bedroom suites each feature custom natural stone baths. The lower entertainment level includes a 10-seat cinema, a ski prep and boot-warming room with direct access to the slopes, a wine cellar of 800-bottle capacity, and a performance gymnasium with vertical climbing wall. An outdoor hot tub and plunge pool are set into the heated granite terrace with unencumbered mountain views.`,
        },
        amenities: ["Ski-In/Ski-Out", "Outdoor Hot Tub", "Plunge Pool", "Ski Room", "Home Cinema", "Climbing Wall", "Wine Cellar", "Radiant Heat", "Furnished", "Mountain Views"],
        media: {
            coverImage: "https://images.unsplash.com/photo-1549294413-26f195200c16?w=1200&q=85",
            photos: [
                "https://images.unsplash.com/photo-1549294413-26f195200c16?w=1200&q=85",
                "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&q=85",
                "https://images.unsplash.com/photo-1601084881623-cdf9a8ea480c?w=1200&q=85",
                "https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=1200&q=85",
            ],
        },
        agent: { name: "André Laurent", phone: "+1 310 555 0003", email: "a.laurent@haven.com", license: "CA-DRE-02114492" },
        userEmail: "admin@haven.com",
    },
    {
        title: "Coconut Grove Waterfront Villa",
        status: "for-sale",
        featured: false,
        type: "villa",
        category: "tropical",
        price: { amount: 8900000, currency: "INR", priceType: "for-sale" },
        location: {
            address: "3411 Main Highway",
            city: "Miami",
            state: "FL",
            country: "US",
            zipCode: "33133",
            neighborhood: "Coconut Grove",
        },
        details: {
            bedrooms: 5, bathrooms: 6, halfBaths: 1,
            squareFeet: 6400, lotSize: 22000, floors: 2, yearBuilt: 2020,
            parking: 4, garage: true, pool: true, furnished: true,
        },
        description: {
            short: "A tropical waterfront villa in Coconut Grove's most exclusive enclave — deep-water dock, resort pool with swim-up bar, and a seamless open-plan design built for the Miami lifestyle.",
            full: `On a protected deepwater channel within Coconut Grove — Miami's oldest and most storied neighborhood, canopied by ancient banyans and ficus — this contemporary waterfront villa fuses inside and out with tropical precision. Direct Biscayne Bay access, a 60-foot private dock accommodating a vessel to 75 feet, and an open-plan design conceived specifically for year-round outdoor living define this singular offering.

The ground level erases the boundary between interior and exteriors through 26-foot bi-fold glass walls spanning the full width of the home. When open, the great room, dining pavilion, and professional kitchen merge with a 3,200-square-foot terrace, a lagoon pool with rock waterfall and swim-up bar, a professional outdoor kitchen, and a grass lawn descending to the private dock.

Five bedroom suites — each with direct outdoor access — include a primary wing with a wraparound terrace over the water, his-and-hers bathrooms of Venetian stone and American black walnut, and a morning kitchen overlooking the slip. The lower dock deck features a boathouse, jet ski launch, and a covered lounge shaded by mature palms.`,
        },
        amenities: ["Deepwater Dock", "Swim-Up Bar", "Outdoor Kitchen", "Waterfall Pool", "Jet Ski Dock", "Electric Gate", "Boathouse", "Smart Home", "Generator"],
        media: {
            coverImage: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=85",
            photos: [
                "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=85",
                "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200&q=85",
                "https://images.unsplash.com/photo-1537726235470-8504e3beef77?w=1200&q=85",
                "https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=1200&q=85",
            ],
        },
        agent: { name: "Isabella Reyes", phone: "+1 305 555 0887", email: "i.reyes@haven.com", license: "FL-RE-BK385721" },
        userEmail: "admin@haven.com",
    },
    {
        title: "Capitol Hill Classic Apartment",
        status: "for-rent",
        featured: false,
        type: "apartment",
        category: "urban",
        price: { amount: 9500, currency: "INR", priceType: "for-rent" },
        location: {
            address: "201 Massachusetts Avenue NE, Unit 12F",
            city: "Washington",
            state: "DC",
            country: "US",
            zipCode: "20002",
            neighborhood: "Capitol Hill",
        },
        details: {
            bedrooms: 2, bathrooms: 2, halfBaths: 0,
            squareFeet: 1620, yearBuilt: 2016,
            parking: 1, garage: true, pool: false, furnished: false,
        },
        description: {
            short: "A refined Capitol Hill residence steps from the Library of Congress — park views, white-glove building services, and a floor plan designed for the capital's most discerning professionals.",
            full: `In the immediate shadow of the Capitol Dome — steps from the Library of Congress, the Supreme Court, and Senate office buildings — this 12th-floor residence offers the capital's ultimate professional address. The building, completed in 2016, was conceived as Washington's most quietly luxurious residential offering: full white-glove services, discreet security, and a concierge with discretion to match the professions of its residents.

The floor plan is a model of considered elegance: a central open living and dining room with 9-foot ceilings and floor-to-ceiling south-east windows framing views of Lincoln Park and the Capitol; a Gaggenau-equipped kitchen in Nero Marquina marble and matte white lacquer; and a primary suite with a walk-in wardrobe and bath in honed Pietra Grigia stone.

The second bedroom functions equally well as a guest suite or private office. Building amenities include 24-hour concierge, fitness center, private garden terrace, underground valet parking, and a private secure entrance for residents.`,
        },
        amenities: ["24hr Concierge", "Valet Parking", "Fitness Center", "Garden Terrace", "Secure Entry", "Package Room", "Bike Storage"],
        media: {
            coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=85",
            photos: [
                "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=85",
                "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=85",
                "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=85",
                "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1200&q=85",
            ],
        },
        agent: { name: "Victor Osei", phone: "+1 202 555 0334", email: "v.osei@haven.com", license: "DC-RE-LP40871" },
        userEmail: "admin@haven.com",
    },
];
