import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const updates = [
  { name: 'Wireless Noise-Cancelling Headphones', image_url: 'https://m.media-amazon.com/images/I/51f7KKP25PL._AC_UF1000,1000_QL80_.jpg' },
  { name: 'USB-C Hub 7-in-1', image_url: 'https://m.media-amazon.com/images/I/61stxcrwNyL._AC_UF1000,1000_QL80_.jpg' },
  { name: 'Mechanical Keyboard', image_url: 'https://www.redragon.in/cdn/shop/products/K551RGB.png?v=1628502100&width=2048' },
  { name: 'Bluetooth Portable Speaker', image_url: 'https://zebronics.com/cdn/shop/products/Zeb-Vita-pic1.jpg?v=1643796076&width=2048' },
  { name: '4K Webcam with Ring Light', image_url: 'https://m.media-amazon.com/images/I/61ptiasAjUL._AC_UF1000,1000_QL80_.jpg' },
  { name: 'Merino Wool Winter Jacket', image_url: 'https://images.squarespace-cdn.com/content/v1/616399a387b45a450e982991/1764827332531-PUNXDPV96MW5IY0VORMP/processed_55ad44d59c514623bcf7a5c38917f598.jpeg?format=1500w' },
  { name: 'Slim Fit Chinos', image_url: 'https://pantproject.com/cdn/shop/files/Evoto-_4-of-7.jpg?v=1755540740&width=1080' },
  { name: 'Running Shoes', image_url: 'https://m.media-amazon.com/images/I/61uBs4q8qFL._AC_UY1000_.jpg' },
  { name: 'Cashmere Beanie', image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgwJW0FVL5_pKga46pIl7FN69plMDVcDixsQ&s' },
  { name: 'Classic Denim Jacket', image_url: 'https://m.media-amazon.com/images/I/51zQhzWUtaL._AC_UY1100_.jpg' },
  { name: 'The Pragmatic Programmer', image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh2gB5LEHeDe-AeY69tswqLty5Jka2P6pkDA&s' },
  { name: 'Atomic Habits', image_url: 'https://www.thezappybox.com/cdn/shop/files/atomic-habits_gallery_hi-res_01.jpg' },
  { name: 'Designing Data-Intensive Applications', image_url: 'https://aksh.dev/blog/book-review-designing-data-intensive-applications/cover.webp' },
  { name: 'Zero to One', image_url: 'https://miro.medium.com/0*bx1t8FQCLTrn9fUW.jpeg' },
  { name: 'Sapiens: A Brief History of Humankind', image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0FxCfM-_t-RbeO2sctksNPeHO2cPndNQPLg&s' },
  { name: 'Cast Iron Skillet', image_url: 'https://www.potsandpans.in/cdn/shop/products/24_0e1f8c46-9dd7-43b4-a939-cca1d1cc6459.jpg?v=1735887768' },
  { name: 'French Press Coffee Maker', image_url: 'https://rukminim2.flixcart.com/image/480/640/xif0q/coffee-maker/7/b/d/french-press-french-press-wonderchef-original-imahjc4fh2vbhehp.jpeg?q=90' },
  { name: 'Scented Soy Candle Set', image_url: 'https://images.woodenstreet.de/image/data/Rasa+Home/28-12/TCS06501/1.jpg' },
  { name: 'Bamboo Cutting Board Set', image_url: 'https://5.imimg.com/data5/SELLER/Default/2024/12/475272254/BN/RE/DI/223320628/3-piece-bamboo-cutting-board-set-reversible-chopping-boards-assorted-sizes-500x500.jpg' },
  { name: 'Smart LED Desk Lamp', image_url: 'https://5.imimg.com/data5/ECOM/Default/2024/9/447641637/EJ/VK/SY/134592362/4428256533-500x500.jpg' },
];

async function main() {
  for (const u of updates) {
    const { data, error } = await supabase
      .from('products')
      .update({ image_url: u.image_url })
      .eq('name', u.name)
      .select('id, name');
    if (error) {
      console.error('FAILED: ' + u.name + ' - ' + error.message);
    } else if (data && data.length > 0) {
      console.log('OK: ' + u.name);
    } else {
      console.log('NOT FOUND: ' + u.name);
    }
  }
  console.log('Done!');
}

main();
