import type { Language } from './types'

type TranslationMap = {
  [key: string]: string
}

type Translations = {
  [K in Language]: TranslationMap
}

export const translations: Translations = {
  mr: {
    // Nav
    'nav.menu': 'मेनू',
    'nav.order': 'ऑर्डर',
    'nav.reserve': 'आरक्षण',
    'nav.offers': 'ऑफर',
    'nav.contact': 'संपर्क',

    // Hero
    'hero.tagline': 'महाराष्ट्राची खरी चव',
    'hero.subtitle': 'हॉटेल आईच्या गावातमध्ये अस्सल महाराष्ट्रीयन थाळी अनुभवा',
    'hero.orderNow': 'आत्ता ऑर्डर करा',
    'hero.reserveTable': 'टेबल बुक करा',

    // Sections
    'sections.signatureDishes': 'आमची खास डिशेस',
    'sections.ourStory': 'आमची कहाणी',
    'sections.exploreMenu': 'मेनू पाहा',
    'sections.whatGuestsSay': 'ग्राहकांचे मत',
    'sections.findUs': 'आम्हाला शोधा',
    'sections.visitUs': 'भेट द्या',
    'sections.todaySpecial': 'आजचे विशेष',
    'sections.contactUs': 'संपर्क करा',

    // Buttons
    'buttons.viewFullMenu': 'पूर्ण मेनू पाहा',
    'buttons.callNow': 'आत्ता फोन करा',
    'buttons.whatsapp': 'व्हाट्सअॅप',
    'buttons.bookTable': 'टेबल बुक करा',
    'buttons.placeOrder': 'ऑर्डर द्या',
    'buttons.addToOrder': 'ऑर्डरमध्ये जोडा',

    // Order page
    'orderPage.selectItems': 'आयटम निवडा',
    'orderPage.yourDetails': 'तुमची माहिती',
    'orderPage.reviewOrder': 'ऑर्डर तपासा',
    'orderPage.step1': 'पायरी १',
    'orderPage.step2': 'पायरी २',
    'orderPage.step3': 'पायरी ३',
    'orderPage.orderType': 'ऑर्डरचा प्रकार',
    'orderPage.dineIn': 'येथे जेवा',
    'orderPage.takeaway': 'घेऊन जा',
    'orderPage.preorder': 'आधी ऑर्डर करा',
    'orderPage.specialInstructions': 'विशेष सूचना',
    'orderPage.total': 'एकूण',
    'orderPage.codOption': 'रोख पेमेंट (COD)',

    // Reservation page
    'reservationPage.bookATable': 'टेबल बुक करा',
    'reservationPage.selectDate': 'तारीख निवडा',
    'reservationPage.selectTime': 'वेळ निवडा',
    'reservationPage.guestCount': 'अतिथींची संख्या',
    'reservationPage.occasion': 'प्रसंग',
    'reservationPage.yourName': 'तुमचे नाव',
    'reservationPage.yourWhatsApp': 'तुमचा व्हाट्सअॅप नंबर',
    'reservationPage.confirmBooking': 'बुकिंग कन्फर्म करा',
    'reservationPage.birthdayOccasion': 'वाढदिवस',
    'reservationPage.anniversaryOccasion': 'वर्धापनदिन',
    'reservationPage.businessOccasion': 'व्यवसाय',
    'reservationPage.otherOccasion': 'इतर',

    // Menu
    'menu.allItems': 'सर्व',
    'menu.vegOnly': 'शाकाहारी',
    'menu.nonVegOnly': 'मांसाहारी',
    'menu.searchPlaceholder': 'मेनू शोधा...',

    // Contact
    'contact.openNow': 'आत्ता उघडे',
    'contact.address': 'पत्ता',
    'contact.phone': 'फोन',
    'contact.hours': 'वेळ',

    // Footer
    'footer.tagline': 'महाराष्ट्राच्या चवीचा अनुभव घ्या',
    'footer.quickLinks': 'जलद लिंक',
    'footer.categories': 'श्रेणी',
    'footer.contact': 'संपर्क',

    // Story
    'story.text': 'हॉटेल आईच्या गावात हे २०१९ साली इचलकरंजीत सुरू झाले. आमचे उद्दिष्ट आहे महाराष्ट्राची खरी चव सर्वांपर्यंत पोहोचवणे. आमच्या अलानी मटण, चिकन फ्राय आणि विशेष थाळ्या यांसाठी आम्ही प्रसिद्ध आहोत.',

    // General
    'general.established': 'स्थापित २०१९',
    'general.reviews': '+ समीक्षा',
    'general.rating': '★ रेटिंग',
    'general.years': 'वर्षे',
    'general.items': '+ आयटम',
    'general.address': 'भवासकर बिल्डिंग, आरबी रोड, कागवडे माळा, इचलकरंजी, महाराष्ट्र ४१६११५',
    'general.hours': 'सकाळी ११:०० – रात्री ११:००',
    'general.everyday': 'रोज',
    'general.close': 'बंद करा',
    'general.copied': 'कॉपी केले!',
    'general.copyAddress': 'पत्ता कॉपी करा',
  },

  en: {
    // Nav
    'nav.menu': 'Menu',
    'nav.order': 'Order',
    'nav.reserve': 'Reserve',
    'nav.offers': 'Offers',
    'nav.contact': 'Contact',

    // Hero
    'hero.tagline': 'The Real Taste of Maharashtra',
    'hero.subtitle': 'Experience authentic Maharashtrian Thali at Hotel Aaichyaa Gavat, Ichalkaranji',
    'hero.orderNow': 'Order Now',
    'hero.reserveTable': 'Reserve a Table',

    // Sections
    'sections.signatureDishes': 'Our Signature Dishes',
    'sections.ourStory': 'Our Story',
    'sections.exploreMenu': 'Explore Menu',
    'sections.whatGuestsSay': 'What Our Guests Say',
    'sections.findUs': 'Find Us',
    'sections.visitUs': 'Visit Us',
    'sections.todaySpecial': "Today's Special",
    'sections.contactUs': 'Contact Us',

    // Buttons
    'buttons.viewFullMenu': 'View Full Menu',
    'buttons.callNow': 'Call Now',
    'buttons.whatsapp': 'WhatsApp',
    'buttons.bookTable': 'Book a Table',
    'buttons.placeOrder': 'Place Order',
    'buttons.addToOrder': 'Add to Order',

    // Order page
    'orderPage.selectItems': 'Select Items',
    'orderPage.yourDetails': 'Your Details',
    'orderPage.reviewOrder': 'Review Order',
    'orderPage.step1': 'Step 1',
    'orderPage.step2': 'Step 2',
    'orderPage.step3': 'Step 3',
    'orderPage.orderType': 'Order Type',
    'orderPage.dineIn': 'Dine-In',
    'orderPage.takeaway': 'Takeaway',
    'orderPage.preorder': 'Pre-Order',
    'orderPage.specialInstructions': 'Special Instructions',
    'orderPage.total': 'Total',
    'orderPage.codOption': 'Cash on Delivery (COD)',

    // Reservation page
    'reservationPage.bookATable': 'Book a Table',
    'reservationPage.selectDate': 'Select Date',
    'reservationPage.selectTime': 'Select Time',
    'reservationPage.guestCount': 'Number of Guests',
    'reservationPage.occasion': 'Occasion',
    'reservationPage.yourName': 'Your Name',
    'reservationPage.yourWhatsApp': 'Your WhatsApp Number',
    'reservationPage.confirmBooking': 'Confirm Booking',
    'reservationPage.birthdayOccasion': 'Birthday',
    'reservationPage.anniversaryOccasion': 'Anniversary',
    'reservationPage.businessOccasion': 'Business',
    'reservationPage.otherOccasion': 'Other',

    // Menu
    'menu.allItems': 'All',
    'menu.vegOnly': 'Veg Only',
    'menu.nonVegOnly': 'Non-Veg',
    'menu.searchPlaceholder': 'Search menu...',

    // Contact
    'contact.openNow': 'Open Now',
    'contact.address': 'Address',
    'contact.phone': 'Phone',
    'contact.hours': 'Hours',

    // Footer
    'footer.tagline': 'Taste the spirit of Maharashtra',
    'footer.quickLinks': 'Quick Links',
    'footer.categories': 'Categories',
    'footer.contact': 'Contact',

    // Story
    'story.text': 'Hotel Aaichyaa Gavat was founded in 2019 in Ichalkaranji with a simple mission: bring the authentic taste of Maharashtra to everyone. We are known for our Alani Mutton, Chicken Fry, and the legendary Special Thali that keeps our guests coming back.',

    // General
    'general.established': 'Est. 2019',
    'general.reviews': '+ Reviews',
    'general.rating': '★ Rating',
    'general.years': 'Yrs',
    'general.items': '+ Items',
    'general.address': 'Bavaskar Building, RB Road, Kagwade Mala, Ichalkaranji, Maharashtra 416115',
    'general.hours': '11:00 AM – 11:00 PM',
    'general.everyday': 'Every day',
    'general.close': 'Close',
    'general.copied': 'Copied!',
    'general.copyAddress': 'Copy Address',
  },
}

