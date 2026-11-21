export const images = {
  hero: "https://images.unsplash.com/photo-1609412058473-c199497c3c5d?auto=format&fit=crop&w=1800&q=85",
  sapa: "https://images.unsplash.com/photo-1696276959983-2da1448e695a?auto=format&fit=crop&w=1000&q=80",
  rice: "https://images.unsplash.com/photo-1731119347526-a51ad22763cd?auto=format&fit=crop&w=1000&q=80",
  mountain: "https://images.unsplash.com/photo-1603269414002-7f3d2acd0409?auto=format&fit=crop&w=1000&q=80",
  valley: "https://images.unsplash.com/photo-1606802029835-7dd0570bf864?auto=format&fit=crop&w=1000&q=80",
  green: "https://images.unsplash.com/photo-1605189914441-47183c6fcd08?auto=format&fit=crop&w=1000&q=80",
};

export interface TripMock {
  id: string;
  title: string;
  destination: string;
  dates: string;
  people: string;
  budget: string;
  status: "Sắp tới" | "Bản nháp" | "Đã qua";
  image: string;
  isDraft?: boolean;
}

export const mockTrips: TripMock[] = [
  {
    id: "sapa-friends",
    title: "Sa Pa cùng hội bạn",
    destination: "Sa Pa, Lào Cai",
    dates: "12–16 tháng 10, 2025",
    people: "4 người",
    budget: "12.000.000 ₫",
    status: "Sắp tới",
    image: images.sapa,
  },
  {
    id: "hoi-an-weekend",
    title: "Hội An cuối tuần",
    destination: "Hội An, Quảng Nam",
    dates: "08–10 tháng 11, 2025",
    people: "2 người",
    budget: "6.500.000 ₫",
    status: "Bản nháp",
    image: images.valley,
    isDraft: true,
  },
];

export const destinationsMock = [
  { name: "Sa Pa", meta: "Lào Cai · Núi & bản làng", image: images.sapa },
  { name: "Mù Cang Chải", meta: "Yên Bái · Mùa vàng", image: images.rice },
  { name: "Hạ Long", meta: "Quảng Ninh · Biển & kỳ quan", image: images.mountain },
  { name: "Hội An", meta: "Quảng Nam · Di sản & ẩm thực", image: images.valley },
];
