# 3D office asset pack

Models used by the CW Monitoring Dashboard's **3D office** tab, all CC0 (public domain):

- Furniture: [Poly Haven](https://polyhaven.com/models) (metal_office_desk, SchoolChair_01, mid_century_lounge_chair, modern_arm_chair_01, sofa_02, coffee_table_round_01, modern_coffee_table_01, side_table_01, potted_plant_02, potted_plant_04, steel_frame_shelves_01, metal_stool_02, modern_ceiling_lamp_01, outdoor_table_chair_set_01, CoffeeCart_01, wall_clock).
- People: Quaternius "Ultimate Modular Men" and "Ultimate Modular Women" (Suit, Casual, Hoodie, Formal outfits), animations stripped.
- Logo: clubwealth.com/brand/clubwealth-logo-black.png upscaled, with the compass from clubwealth.com/icon.png.

Pipeline: `phdl.py <names…>` downloads Poly Haven glTF (1k) into `../dl/ph`; `build.mjs` packs everything to small .glb
(WebP textures, mesh simplification, quantization); `plants.mjs` re-simplifies the plants and chairs; `p2.mjs` drops unused
accessors from the people. Artifacts don't serve .glb, so each .glb is published as `office3d/<name>.json` = `{"glb": "<base64>"}`
and decoded in the page.
