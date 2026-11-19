import { PhotoScene } from "@/components/PhotoScene";
import { recipeById } from "@/data/recipes";
import { fmt } from "@/lib/utils";

const chips = (id: number) => {
  const r = recipeById(id);
  return [`${fmt(r.kcal)} kcal`, `${fmt(r.protein)} g protein`, `${fmt(r.sugar)} g added sugar`];
};

export function CrunchScene() {
  return (
    <PhotoScene
      id="crunch"
      bg="bg-blush"
      eyebrow="Recipe 02 · Crunchy & salty"
      title="from three potatoes to a real snap"
      mode="drop"
      hero={{ src: "/recipes/02.webp", alt: "Crisp baked potato chips from Recipe 02", w: 36, ratio: 1.5, framed: true }}
      orbit={[
        { src: "/cut/03.webp", x: 13, y: 26, w: 13, rot: -14, depth: 1.2 },
        { src: "/cut/04.webp", x: 87, y: 24, w: 13, rot: 16, depth: 0.8 },
        { src: "/cut/05.webp", x: 11, y: 76, w: 20, rot: -6, depth: 1.5 },
        { src: "/cut/40.webp", x: 89, y: 75, w: 21, rot: 8, depth: 1 },
        { src: "/cut/06.webp", x: 50, y: 9, w: 15, rot: 4, depth: 0.6 },
      ]}
      steps={[
        { h: "Start with three russets", p: "500 g russet potatoes (about 3 medium), scrubbed and left unpeeled." },
        { h: "Slice thin, rinse, dry", p: "1/16-inch (1.5 mm) rounds on a mandoline with its guard. Rinse off surface starch and pat very dry — dry slices crisp instead of steaming." },
        { h: "Oil, salt, 400°F", p: "10 g olive oil and 2 g fine salt, one layer, no overlap. Bake at 400°F (204°C) and pull chips as the edges turn light golden." },
        { h: `${fmt(recipeById(2).kcal)} kcal a serving`, p: "A serving is 1/4 of the batch — about 28–30 g, roughly 25–35 chips. They finish crisping as they cool." },
      ]}
      chips={chips(2)}
      note="Direct-format alternative, inspired by Lay's Classic (not affiliated). Per serving, estimated."
    />
  );
}

export function RibbonScene() {
  return (
    <PhotoScene
      id="ribbon"
      bg="bg-mint"
      eyebrow="Recipe 37 · Fruit-forward sweet snacks"
      title="four whole fruits, one flexible ribbon"
      mode="unroll"
      hero={{ src: "/recipes/37.webp", alt: "Homemade fruit roll-up strips from Recipe 37", w: 36, ratio: 1.5, framed: true }}
      orbit={[
        { src: "/cut/27.webp", x: 13, y: 28, w: 15, rot: -8, depth: 1.2 },
        { src: "/cut/15.webp", x: 87, y: 27, w: 12, rot: 9, depth: 0.9 },
        { src: "/cut/22.webp", x: 11, y: 76, w: 19, rot: -6, depth: 1.4 },
        { src: "/cut/24.webp", x: 89, y: 75, w: 14, rot: 8, depth: 1 },
        { src: "/cut/23.webp", x: 50, y: 9, w: 14, rot: 3, depth: 0.6 },
      ]}
      steps={[
        { h: "Blended smooth", p: "300 g apple, 250 g strawberries, 150 g blueberries and 10 g lemon juice — no honey, syrup or added sugar. Heated to 160°F (71°C), then cooled 5 minutes." },
        { h: "Spread thin, dried low", p: "Spread 1/8–1/4 inch (3–6 mm) on lined dehydrator trays and dried at 140°F (60°C) for 6–12 hours, until the centre springs back but still bends." },
        { h: "Cooled and cut", p: "Cooled 30 minutes, peeled from the liner and cut with clean scissors into 6 narrow strips, then rolled." },
      ]}
      chips={chips(37)}
      note="Per serving, estimated."
    />
  );
}
