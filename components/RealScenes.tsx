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
      plate="bg-butter"
      crumbs={["#e9a23b", "#c9722a", "#fff1c9"]}
      eyebrow="Recipe 02 · Crunchy & salty"
      title="from three potatoes to a real snap"
      mode="drop"
      hero={{ src: "/recipes/02.webp", alt: "Crisp baked potato chips from Recipe 02", h: 76, ratio: 1.5 }}
      orbit={[
        { src: "/cut/03.webp", x: 14, y: 28, w: 21, rot: -12, depth: 1.2 },
        { src: "/cut/04.webp", x: 85, y: 26, w: 23, rot: 14, depth: 0.8 },
        { src: "/cut/06.webp", x: 50, y: 12, w: 22, rot: 4, depth: 0.6 },
        { src: "/cut/05.webp", x: 16, y: 76, w: 29, rot: -7, depth: 1.5, front: true },
        { src: "/cut/40.webp", x: 85, y: 76, w: 27, rot: 8, depth: 1, front: true },
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
      plate="bg-blush"
      crumbs={["#b0214f", "#ff5a7a", "#ffe3ea"]}
      eyebrow="Recipe 37 · Fruit-forward sweet snacks"
      title="four whole fruits, one flexible ribbon"
      mode="unroll"
      hero={{ src: "/recipes/37.webp", alt: "Homemade fruit roll-up strips from Recipe 37", h: 76, ratio: 1.5 }}
      orbit={[
        { src: "/cut/27.webp", x: 14, y: 26, w: 27, rot: -8, depth: 1.2 },
        { src: "/cut/15.webp", x: 86, y: 26, w: 21, rot: 9, depth: 0.9 },
        { src: "/cut/23.webp", x: 50, y: 13, w: 20, rot: 3, depth: 0.6 },
        { src: "/cut/22.webp", x: 15, y: 77, w: 28, rot: -6, depth: 1.4, front: true },
        { src: "/cut/24.webp", x: 86, y: 77, w: 26, rot: 8, depth: 1, front: true },
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
