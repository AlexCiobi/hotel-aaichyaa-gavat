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
    'hero.subtitle': 'थाली हाऊसमध्ये अस्सल महाराष्ट्रीयन थाळी अनुभवा',
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
    'story.text': 'थाली हाऊस हे २०१९ साली इचलकरंजीत सुरू झाले. आमचे उद्दिष्ट आहे महाराष्ट्राची खरी चव सर्वांपर्यंत पोहोचवणे. आमच्या अलानी मटण, चिकन फ्राय आणि विशेष थाळ्या यांसाठी आम्ही प्रसिद्ध आहोत.',

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

  hi: {
    // Nav
    'nav.menu': 'मेनू',
    'nav.order': 'ऑर्डर',
    'nav.reserve': 'बुकिंग',
    'nav.offers': 'ऑफर',
    'nav.contact': 'संपर्क',

    // Hero
    'hero.tagline': 'महाराष्ट्र का असली स्वाद',
    'hero.subtitle': 'थाली हाउस में प्रामाणिक महाराष्ट्रीयन थाली का आनंद लें',
    'hero.orderNow': 'अभी ऑर्डर करें',
    'hero.reserveTable': 'टेबल बुक करें',

    // Sections
    'sections.signatureDishes': 'हमारी खास डिशेज़',
    'sections.ourStory': 'हमारी कहानी',
    'sections.exploreMenu': 'मेनू देखें',
    'sections.whatGuestsSay': 'ग्राहकों की राय',
    'sections.findUs': 'हमें खोजें',
    'sections.visitUs': 'मिलने आएं',
    'sections.todaySpecial': 'आज का विशेष',
    'sections.contactUs': 'संपर्क करें',

    // Buttons
    'buttons.viewFullMenu': 'पूरा मेनू देखें',
    'buttons.callNow': 'अभी कॉल करें',
    'buttons.whatsapp': 'व्हाट्सएप',
    'buttons.bookTable': 'टेबल बुक करें',
    'buttons.placeOrder': 'ऑर्डर दें',
    'buttons.addToOrder': 'ऑर्डर में जोड़ें',

    // Order page
    'orderPage.selectItems': 'आइटम चुनें',
    'orderPage.yourDetails': 'आपकी जानकारी',
    'orderPage.reviewOrder': 'ऑर्डर जांचें',
    'orderPage.step1': 'चरण १',
    'orderPage.step2': 'चरण २',
    'orderPage.step3': 'चरण ३',
    'orderPage.orderType': 'ऑर्डर का प्रकार',
    'orderPage.dineIn': 'यहाँ खाएं',
    'orderPage.takeaway': 'ले जाएं',
    'orderPage.preorder': 'पहले ऑर्डर करें',
    'orderPage.specialInstructions': 'विशेष निर्देश',
    'orderPage.total': 'कुल',
    'orderPage.codOption': 'नकद भुगतान (COD)',

    // Reservation page
    'reservationPage.bookATable': 'टेबल बुक करें',
    'reservationPage.selectDate': 'तारीख चुनें',
    'reservationPage.selectTime': 'समय चुनें',
    'reservationPage.guestCount': 'अतिथियों की संख्या',
    'reservationPage.occasion': 'अवसर',
    'reservationPage.yourName': 'आपका नाम',
    'reservationPage.yourWhatsApp': 'आपका व्हाट्सएप नंबर',
    'reservationPage.confirmBooking': 'बुकिंग कन्फर्म करें',
    'reservationPage.birthdayOccasion': 'जन्मदिन',
    'reservationPage.anniversaryOccasion': 'सालगिरह',
    'reservationPage.businessOccasion': 'व्यवसाय',
    'reservationPage.otherOccasion': 'अन्य',

    // Menu
    'menu.allItems': 'सभी',
    'menu.vegOnly': 'शाकाहारी',
    'menu.nonVegOnly': 'मांसाहारी',
    'menu.searchPlaceholder': 'मेनू खोजें...',

    // Contact
    'contact.openNow': 'अभी खुला',
    'contact.address': 'पता',
    'contact.phone': 'फ़ोन',
    'contact.hours': 'समय',

    // Footer
    'footer.tagline': 'महाराष्ट्र के स्वाद का अनुभव करें',
    'footer.quickLinks': 'त्वरित लिंक',
    'footer.categories': 'श्रेणियाँ',
    'footer.contact': 'संपर्क',

    // Story
    'story.text': 'थाली हाउस की स्थापना २०१९ में इचलकरंजी में हुई थी। हमारा उद्देश्य है महाराष्ट्र के प्रामाणिक स्वाद को सभी तक पहुंचाना। हम अलानी मटन, चिकन फ्राय और विशेष थाली के लिए प्रसिद्ध हैं।',

    // General
    'general.established': 'स्थापित २०१९',
    'general.reviews': '+ समीक्षाएं',
    'general.rating': '★ रेटिंग',
    'general.years': 'साल',
    'general.items': '+ आइटम',
    'general.address': 'भवासकर बिल्डिंग, आरबी रोड, कागवडे माला, इचलकरंजी, महाराष्ट्र ४१६११५',
    'general.hours': 'सुबह ११:०० – रात ११:००',
    'general.everyday': 'रोज़',
    'general.close': 'बंद करें',
    'general.copied': 'कॉपी हो गया!',
    'general.copyAddress': 'पता कॉपी करें',
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
    'hero.subtitle': 'Experience authentic Maharashtrian Thali at Thali House, Ichalkaranji',
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
    'story.text': 'Thali House was founded in 2019 in Ichalkaranji with a simple mission: bring the authentic taste of Maharashtra to everyone. We are known for our Alani Mutton, Chicken Fry, and the legendary Special Thali that keeps our guests coming back.',

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

  kn: {
    // Nav
    'nav.menu': 'ಮೆನು',
    'nav.order': 'ಆರ್ಡರ್',
    'nav.reserve': 'ಬುಕ್ ಮಾಡಿ',
    'nav.offers': 'ಆಫರ್',
    'nav.contact': 'ಸಂಪರ್ಕ',

    // Hero
    'hero.tagline': 'ಮಹಾರಾಷ್ಟ್ರದ ನಿಜವಾದ ರುಚಿ',
    'hero.subtitle': 'ಥಾಲಿ ಹೌಸ್‌ನಲ್ಲಿ ಅಸಲಿ ಮಹಾರಾಷ್ಟ್ರೀಯನ್ ಥಾಲಿ ಅನುಭವಿಸಿ',
    'hero.orderNow': 'ಈಗ ಆರ್ಡರ್ ಮಾಡಿ',
    'hero.reserveTable': 'ಟೇಬಲ್ ಬುಕ್ ಮಾಡಿ',

    // Sections
    'sections.signatureDishes': 'ನಮ್ಮ ವಿಶೇಷ ಡಿಶ್‌ಗಳು',
    'sections.ourStory': 'ನಮ್ಮ ಕಥೆ',
    'sections.exploreMenu': 'ಮೆನು ನೋಡಿ',
    'sections.whatGuestsSay': 'ಅತಿಥಿಗಳ ಅಭಿಪ್ರಾಯ',
    'sections.findUs': 'ನಮ್ಮನ್ನು ಹುಡುಕಿ',
    'sections.visitUs': 'ಭೇಟಿ ನೀಡಿ',
    'sections.todaySpecial': 'ಇಂದಿನ ವಿಶೇಷ',
    'sections.contactUs': 'ಸಂಪರ್ಕಿಸಿ',

    // Buttons
    'buttons.viewFullMenu': 'ಪೂರ್ಣ ಮೆನು ನೋಡಿ',
    'buttons.callNow': 'ಈಗ ಕರೆ ಮಾಡಿ',
    'buttons.whatsapp': 'ವಾಟ್ಸಾಪ್',
    'buttons.bookTable': 'ಟೇಬಲ್ ಬುಕ್ ಮಾಡಿ',
    'buttons.placeOrder': 'ಆರ್ಡರ್ ಕೊಡಿ',
    'buttons.addToOrder': 'ಆರ್ಡರ್‌ಗೆ ಸೇರಿಸಿ',

    // Order page
    'orderPage.selectItems': 'ಐಟಂಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಿ',
    'orderPage.yourDetails': 'ನಿಮ್ಮ ವಿವರಗಳು',
    'orderPage.reviewOrder': 'ಆರ್ಡರ್ ಪರಿಶೀಲಿಸಿ',
    'orderPage.step1': 'ಹಂತ ೧',
    'orderPage.step2': 'ಹಂತ ೨',
    'orderPage.step3': 'ಹಂತ ೩',
    'orderPage.orderType': 'ಆರ್ಡರ್ ವಿಧ',
    'orderPage.dineIn': 'ಇಲ್ಲೇ ತಿನ್ನಿ',
    'orderPage.takeaway': 'ತೆಗೆದುಕೊಂಡು ಹೋಗಿ',
    'orderPage.preorder': 'ಮೊದಲು ಆರ್ಡರ್ ಮಾಡಿ',
    'orderPage.specialInstructions': 'ವಿಶೇಷ ಸೂಚನೆಗಳು',
    'orderPage.total': 'ಒಟ್ಟು',
    'orderPage.codOption': 'ನಗದು ಪಾವತಿ (COD)',

    // Reservation page
    'reservationPage.bookATable': 'ಟೇಬಲ್ ಬುಕ್ ಮಾಡಿ',
    'reservationPage.selectDate': 'ದಿನಾಂಕ ಆಯ್ಕೆ ಮಾಡಿ',
    'reservationPage.selectTime': 'ಸಮಯ ಆಯ್ಕೆ ಮಾಡಿ',
    'reservationPage.guestCount': 'ಅತಿಥಿಗಳ ಸಂಖ್ಯೆ',
    'reservationPage.occasion': 'ಸಂದರ್ಭ',
    'reservationPage.yourName': 'ನಿಮ್ಮ ಹೆಸರು',
    'reservationPage.yourWhatsApp': 'ನಿಮ್ಮ ವಾಟ್ಸಾಪ್ ಸಂಖ್ಯೆ',
    'reservationPage.confirmBooking': 'ಬುಕಿಂಗ್ ಕನ್‌ಫರ್ಮ್ ಮಾಡಿ',
    'reservationPage.birthdayOccasion': 'ಹುಟ್ಟುಹಬ್ಬ',
    'reservationPage.anniversaryOccasion': 'ವಾರ್ಷಿಕೋತ್ಸವ',
    'reservationPage.businessOccasion': 'ವ್ಯವಹಾರ',
    'reservationPage.otherOccasion': 'ಇತರ',

    // Menu
    'menu.allItems': 'ಎಲ್ಲಾ',
    'menu.vegOnly': 'ಸಸ್ಯಾಹಾರ',
    'menu.nonVegOnly': 'ಮಾಂಸಾಹಾರ',
    'menu.searchPlaceholder': 'ಮೆನು ಹುಡುಕಿ...',

    // Contact
    'contact.openNow': 'ಈಗ ತೆರೆದಿದೆ',
    'contact.address': 'ವಿಳಾಸ',
    'contact.phone': 'ಫೋನ್',
    'contact.hours': 'ಸಮಯ',

    // Footer
    'footer.tagline': 'ಮಹಾರಾಷ್ಟ್ರದ ರುಚಿ ಅನುಭವಿಸಿ',
    'footer.quickLinks': 'ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು',
    'footer.categories': 'ವಿಭಾಗಗಳು',
    'footer.contact': 'ಸಂಪರ್ಕ',

    // Story
    'story.text': 'ಥಾಲಿ ಹೌಸ್ ೨೦೧೯ ರಲ್ಲಿ ಇಚಲಕರಂಜಿಯಲ್ಲಿ ಸ್ಥಾಪಿಸಲಾಯಿತು. ನಮ್ಮ ಉದ್ದೇಶ ಮಹಾರಾಷ್ಟ್ರದ ಅಸಲಿ ರುಚಿಯನ್ನು ಎಲ್ಲರಿಗೂ ತಲುಪಿಸುವುದು. ನಮ್ಮ ಅಲಾನಿ ಮಟನ್, ಚಿಕನ್ ಫ್ರೈ ಮತ್ತು ವಿಶೇಷ ಥಾಲಿ ಗಳಿಗೆ ನಾವು ಪ್ರಸಿದ್ಧರಾಗಿದ್ದೇವೆ.',

    // General
    'general.established': 'ಸ್ಥಾ. ೨೦೧೯',
    'general.reviews': '+ ರಿವ್ಯೂ',
    'general.rating': '★ ರೇಟಿಂಗ್',
    'general.years': 'ವರ್ಷ',
    'general.items': '+ ಐಟಂ',
    'general.address': 'ಭವಾಸ್ಕರ್ ಬಿಲ್ಡಿಂಗ್, ಆರ್‌ಬಿ ರೋಡ್, ಕಾಗ್ವಡೆ ಮಾಲ, ಇಚಲಕರಂಜಿ, ಮಹಾರಾಷ್ಟ್ರ ೪೧೬೧೧೫',
    'general.hours': 'ಬೆಳಿಗ್ಗೆ ೧೧:೦೦ – ರಾತ್ರಿ ೧೧:೦೦',
    'general.everyday': 'ಪ್ರತಿದಿನ',
    'general.close': 'ಮುಚ್ಚಿ',
    'general.copied': 'ನಕಲು ಮಾಡಲಾಗಿದೆ!',
    'general.copyAddress': 'ವಿಳಾಸ ನಕಲು ಮಾಡಿ',
  },
}
