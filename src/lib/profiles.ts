import type { Profile } from "./discover";

type Seed = [name: string, age: number, gender: "men" | "women", place: string, bio: string, interests: string[], likesMe?: true];

const SEEDS: Seed[] = [
  ["Aanya", 21, "women", "IIT Delhi", "Will trade notes for chai. Currently losing at chess to my roommate.", ["Chess", "Chai", "Indie music"]],
  ["Kabir", 22, "men", "Mumbai", "Weekend trekker, weekday spreadsheet goblin.", ["Trekking", "Photography", "Excel"], true],
  ["Meera", 20, "women", "Miranda House", "Debate team captain. I will argue about pineapple on pizza.", ["Debate", "Pizza", "Poetry"]],
  ["Arjun", 23, "men", "Bengaluru", "Building side projects I never finish. Ask me about any of them.", ["Coding", "Cricket", "Coffee"]],
  ["Ishita", 21, "women", "NIFT Delhi", "Sketchbook always in my bag. Thrift store regular.", ["Design", "Thrifting", "Sketching"], true],
  ["Rohan", 24, "men", "Pune", "Home cook with exactly three signature dishes.", ["Cooking", "Football", "Podcasts"]],
  ["Diya", 19, "women", "St. Xavier's Mumbai", "Theatre kid who never grew out of it.", ["Theatre", "Musicals", "Dance"]],
  ["Vihaan", 22, "men", "BITS Pilani", "Sunrise runner. Sunset guitarist.", ["Running", "Guitar", "Astronomy"]],
  ["Saanvi", 23, "women", "Hyderabad", "Product designer by day, plant parent by night.", ["Plants", "UX", "Yoga"]],
  ["Aditya", 21, "men", "IIT Bombay", "Quiz club regular. I know useless facts about flags.", ["Quizzing", "Geography", "Badminton"], true],
  ["Anika", 22, "women", "Chennai", "Carnatic vocalist who secretly loves EDM.", ["Music", "EDM", "Travel"]],
  ["Reyansh", 20, "men", "Christ University", "Film photographer. Yes, I still buy film rolls.", ["Film photography", "Cinema", "Cycling"]],
  ["Kiara", 24, "women", "Goa", "Surf lessons, sunsets, and too many beach dogs.", ["Surfing", "Dogs", "Reading"]],
  ["Ayaan", 23, "men", "Kolkata", "Biryani loyalist (Kolkata style, obviously).", ["Food", "History", "Football"]],
  ["Myra", 21, "women", "LSR Delhi", "Economics major. Will explain inflation with memes.", ["Economics", "Memes", "Baking"], true],
  ["Dhruv", 22, "men", "NIT Trichy", "Robotics club. My robot has a name and it is Kevin.", ["Robotics", "Anime", "Gaming"]],
  ["Navya", 20, "women", "Ahmedabad", "Garba champion three years running.", ["Dance", "Festivals", "Art"]],
  ["Ishaan", 24, "men", "Gurugram", "Consultant who is trying to rediscover hobbies.", ["Tennis", "Jazz", "Wine"]],
  ["Pari", 22, "women", "Manipal", "Med student. I will remind you to drink water.", ["Medicine", "Swimming", "K-dramas"], true],
  ["Atharv", 21, "men", "IIIT Hyderabad", "Competitive programmer, competitive snacker.", ["Algorithms", "Snacks", "Chess"]],
  ["Riya", 23, "women", "Jaipur", "Heritage walks and haveli photography.", ["Architecture", "Photography", "Travel"]],
  ["Vivaan", 20, "men", "Ashoka University", "Philosophy major. Let's overthink things together.", ["Philosophy", "Books", "Frisbee"]],
  ["Tara", 21, "women", "Bengaluru", "Climbing gym regular. Ask me for beta.", ["Bouldering", "Hiking", "Coffee"], true],
  ["Krish", 22, "men", "DTU Delhi", "Stand-up open mic survivor.", ["Comedy", "Writing", "Basketball"]],
  ["Aadhya", 24, "women", "Kochi", "Backwaters, books, and banana chips.", ["Reading", "Kayaking", "Food"]],
  ["Shaurya", 23, "men", "Chandigarh", "Gym in the morning, momos at night. Balance.", ["Fitness", "Momos", "Cars"]],
  ["Zara", 20, "women", "Symbiosis Pune", "Law student who reads the terms and conditions.", ["Law", "Crime podcasts", "Pottery"]],
  ["Arnav", 21, "men", "VIT Vellore", "Drummer in a band that plays exactly one cover.", ["Drums", "Music", "Gaming"], true],
  ["Sara", 22, "women", "Lucknow", "Kathak dancer and amateur calligrapher.", ["Kathak", "Calligraphy", "Urdu poetry"]],
  ["Yash", 24, "men", "Indore", "Street food guide for anyone who asks.", ["Street food", "Cricket", "Travel"]],
  ["Avni", 21, "women", "IISER Pune", "Studying stars, mostly awake at night anyway.", ["Astronomy", "Sci-fi", "Stargazing"]],
  ["Neel", 23, "men", "Shillong", "Bassist, hill walker, rainy-day enthusiast.", ["Bass", "Hiking", "Rain"], true],
];

export const PROFILES: readonly Profile[] = SEEDS.map(([name, age, gender, place, bio, interests, likesMe], i) => ({
  id: `p${String(i + 1).padStart(2, "0")}`,
  name,
  age,
  photo: `https://randomuser.me/api/portraits/${gender}/${(i * 7) % 90}.jpg`,
  bio,
  place,
  interests,
  likesMe: likesMe ?? false,
}));
