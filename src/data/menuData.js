export const menuData = {
  all: [],
  starters: [
    { id: 1, name: 'Punugulu', desc: 'Crispy rice fritters with ginger & green chili', price: 120, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', veg: true, bestseller: true },
    { id: 2, name: 'Royyala Vepudu', desc: 'Spicy Godavari-style prawn fry', price: 280, img: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?w=400', veg: false, bestseller: true },
    { id: 3, name: 'Mirchi Bajji', desc: 'Stuffed chili fritters with tangy chutney', price: 100, img: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400', veg: true },
    { id: 4, name: 'Pesarattu', desc: 'Green gram dosa with upma filling', price: 90, img: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400', veg: true },
    { id: 5, name: 'Vankaya Bajji', desc: 'Crispy eggplant fritters', price: 110, img: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400', veg: true },
    { id: 6, name: 'Kodi Vepudu', desc: 'Spicy chicken fry starter', price: 260, img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', veg: false },
  ],
  mains: [
    { id: 7, name: 'Gongura Chicken', desc: 'Tangy sorrel leaves chicken curry', price: 240, img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', veg: false, bestseller: true },
    { id: 8, name: 'Natu Kodi Pulusu', desc: 'Country chicken curry with traditional spices', price: 320, img: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400', veg: false },
    { id: 9, name: 'Royyala Iguru', desc: 'Prawns cooked in thick onion tomato gravy', price: 340, img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', veg: false },
    { id: 10, name: 'Chepala Pulusu', desc: 'Tangy fish curry with tamarind', price: 280, img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400', veg: false },
    { id: 11, name: 'Mamidikaya Pappu', desc: 'Raw mango dal with traditional tempering', price: 160, img: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400', veg: true },
    { id: 12, name: 'Bendakaya Fry', desc: 'Crispy okra fry with spices', price: 140, img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400', veg: true },
  ],
  biryani: [
    { id: 13, name: 'Natu Kodi Biryani', desc: 'Country chicken biryani with aromatic spices', price: 350, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', veg: false, bestseller: true },
    { id: 14, name: 'Royyala Biryani', desc: 'Prawn biryani with coastal flavors', price: 380, img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400', veg: false },
    { id: 15, name: 'Vegetable Dum Biryani', desc: 'Mixed vegetable biryani cooked in dum style', price: 220, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', veg: true },
    { id: 16, name: 'Kodi Pulao', desc: 'Chicken pulao with mild spices', price: 280, img: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', veg: false },
    { id: 17, name: 'Pesarattu Upma', desc: 'Green gram dosa with upma combo', price: 150, img: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400', veg: true },
  ],
  desserts: [
    { id: 18, name: 'Pala Thalikalu', desc: 'Traditional milk sweet with cardamom', price: 90, img: 'https://images.unsplash.com/photo-1589113110374-2786355913e6?w=400', veg: true },
    { id: 19, name: 'Bobbatlu', desc: 'Sweet flatbread with jaggery lentil filling', price: 80, img: 'https://images.unsplash.com/photo-1626128666497-ecdf23fcd750?w=400', veg: true, bestseller: true },
    { id: 20, name: 'Ariselu', desc: 'Traditional rice flour sweet with jaggery', price: 100, img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400', veg: true },
    { id: 21, name: 'Kova Kajjikayalu', desc: 'Fried dumplings with khoya filling', price: 120, img: 'https://images.unsplash.com/photo-1621447509370-588bc3b23089?w=400', veg: true },
  ],
  beverages: [
    { id: 22, name: 'Filter Coffee', desc: 'Traditional South Indian filter coffee', price: 50, img: 'https://images.unsplash.com/photo-1544787210-2213d2426687?w=400', veg: true },
    { id: 23, name: 'Majjiga', desc: 'Spiced buttermilk with curry leaves', price: 40, img: 'https://images.unsplash.com/photo-1600271772470-bd22aeb19409?w=400', veg: true },
    { id: 24, name: 'Fresh Lime Soda', desc: 'Refreshing lime soda with mint', price: 60, img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400', veg: true },
    { id: 25, name: 'Mango Lassi', desc: 'Creamy mango yogurt drink', price: 80, img: 'https://images.unsplash.com/photo-1571006682858-a5c7154eaa44?w=400', veg: true },
  ],
}

// Populate 'all' category
menuData.all = [...menuData.starters, ...menuData.mains, ...menuData.biryani, ...menuData.desserts, ...menuData.beverages]

export const categories = {
  all: 'All',
  starters: 'Starters',
  mains: 'Main Course',
  biryani: 'Biryani & Specials',
  desserts: 'Desserts',
  beverages: 'Beverages'
}
