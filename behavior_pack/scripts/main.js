import { world, system, EquipmentSlot, ItemStack } from "@minecraft/server";

// Blocks that should NOT drop anything (unbreakable blocks we're allowing to break)
const NO_DROP_BLOCKS = new Set([
  "minecraft:bedrock",
  "minecraft:end_portal_frame",
  "minecraft:end_portal",
  "minecraft:end_gateway",
  "minecraft:command_block",
  "minecraft:chain_command_block",
  "minecraft:repeating_command_block",
  "minecraft:structure_block",
  "minecraft:structure_void",
  "minecraft:jigsaw",
  "minecraft:barrier",
  "minecraft:light_block",
  "minecraft:border_block",
  "minecraft:allow",
  "minecraft:deny"
]);

// Blocks that drop something different than themselves (normal mining behavior)
// Format: [blockId, { item: dropItemId, min: minCount, max: maxCount }]
const NORMAL_DROPS = new Map([
  // Stone drops cobblestone
  ["minecraft:stone", { item: "minecraft:cobblestone", min: 1, max: 1 }],

  // Ores drop raw materials or gems
  ["minecraft:coal_ore", { item: "minecraft:coal", min: 1, max: 1 }],
  ["minecraft:deepslate_coal_ore", { item: "minecraft:coal", min: 1, max: 1 }],
  ["minecraft:iron_ore", { item: "minecraft:raw_iron", min: 1, max: 1 }],
  ["minecraft:deepslate_iron_ore", { item: "minecraft:raw_iron", min: 1, max: 1 }],
  ["minecraft:copper_ore", { item: "minecraft:raw_copper", min: 2, max: 5 }],
  ["minecraft:deepslate_copper_ore", { item: "minecraft:raw_copper", min: 2, max: 5 }],
  ["minecraft:gold_ore", { item: "minecraft:raw_gold", min: 1, max: 1 }],
  ["minecraft:deepslate_gold_ore", { item: "minecraft:raw_gold", min: 1, max: 1 }],
  ["minecraft:diamond_ore", { item: "minecraft:diamond", min: 1, max: 1 }],
  ["minecraft:deepslate_diamond_ore", { item: "minecraft:diamond", min: 1, max: 1 }],
  ["minecraft:lapis_ore", { item: "minecraft:lapis_lazuli", min: 4, max: 9 }],
  ["minecraft:deepslate_lapis_ore", { item: "minecraft:lapis_lazuli", min: 4, max: 9 }],
  ["minecraft:redstone_ore", { item: "minecraft:redstone", min: 4, max: 5 }],
  ["minecraft:deepslate_redstone_ore", { item: "minecraft:redstone", min: 4, max: 5 }],
  ["minecraft:emerald_ore", { item: "minecraft:emerald", min: 1, max: 1 }],
  ["minecraft:deepslate_emerald_ore", { item: "minecraft:emerald", min: 1, max: 1 }],
  ["minecraft:nether_quartz_ore", { item: "minecraft:quartz", min: 1, max: 1 }],
  ["minecraft:nether_gold_ore", { item: "minecraft:gold_nugget", min: 2, max: 6 }],

  // Grass/dirt variants drop dirt
  ["minecraft:grass_block", { item: "minecraft:dirt", min: 1, max: 1 }],
  ["minecraft:mycelium", { item: "minecraft:dirt", min: 1, max: 1 }],
  ["minecraft:podzol", { item: "minecraft:dirt", min: 1, max: 1 }],

  // Glowstone drops dust
  ["minecraft:glowstone", { item: "minecraft:glowstone_dust", min: 2, max: 4 }],

  // Sea lantern drops prismarine crystals
  ["minecraft:sea_lantern", { item: "minecraft:prismarine_crystals", min: 2, max: 3 }],

  // Melon drops slices
  ["minecraft:melon_block", { item: "minecraft:melon_slice", min: 3, max: 7 }],

  // Bookshelf drops books
  ["minecraft:bookshelf", { item: "minecraft:book", min: 3, max: 3 }],

  // Clay drops clay balls
  ["minecraft:clay", { item: "minecraft:clay_ball", min: 4, max: 4 }],

  // Snow layer drops snowballs
  ["minecraft:snow_layer", { item: "minecraft:snowball", min: 1, max: 1 }],

  // Gravel can drop flint (simplified - always drops gravel here)
  ["minecraft:gravel", { item: "minecraft:gravel", min: 1, max: 1 }],

  // Ice drops nothing normally (unless silk touch)
  ["minecraft:ice", { item: null, min: 0, max: 0 }],

  // Glass drops nothing normally
  ["minecraft:glass", { item: null, min: 0, max: 0 }],
  ["minecraft:glass_pane", { item: null, min: 0, max: 0 }],

  // Infested blocks drop nothing (no silverfish spawn in this simplified version)
  ["minecraft:infested_stone", { item: null, min: 0, max: 0 }],
  ["minecraft:infested_cobblestone", { item: null, min: 0, max: 0 }],
  ["minecraft:infested_stone_bricks", { item: null, min: 0, max: 0 }],
  ["minecraft:infested_mossy_stone_bricks", { item: null, min: 0, max: 0 }],
  ["minecraft:infested_cracked_stone_bricks", { item: null, min: 0, max: 0 }],
  ["minecraft:infested_chiseled_stone_bricks", { item: null, min: 0, max: 0 }],
  ["minecraft:infested_deepslate", { item: null, min: 0, max: 0 }],

  // Amethyst clusters drop shards
  ["minecraft:amethyst_cluster", { item: "minecraft:amethyst_shard", min: 4, max: 4 }],
  ["minecraft:large_amethyst_bud", { item: null, min: 0, max: 0 }],
  ["minecraft:medium_amethyst_bud", { item: null, min: 0, max: 0 }],
  ["minecraft:small_amethyst_bud", { item: null, min: 0, max: 0 }],
  ["minecraft:budding_amethyst", { item: null, min: 0, max: 0 }],
]);

// Check if player is holding the Coin Hoe
function isHoldingCoinHoe(player) {
  try {
    const equipment = player.getComponent("equippable");
    if (!equipment) return false;

    const mainhand = equipment.getEquipment(EquipmentSlot.Mainhand);
    if (!mainhand) return false;

    return mainhand.typeId === "coin:coin_hoe";
  } catch (e) {
    return false;
  }
}

// Subscribe to block break events for special block handling
world.beforeEvents.playerBreakBlock.subscribe((event) => {
  const player = event.player;
  const block = event.block;
  const blockId = block.typeId;

  // Only process if player is holding Coin Hoe
  if (!isHoldingCoinHoe(player)) return;

  // Check if this block shouldn't drop anything
  if (NO_DROP_BLOCKS.has(blockId)) {
    // Cancel the event and destroy the block without drops
    event.cancel = true;
    system.run(() => {
      try {
        const dimension = block.dimension;
        dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} air destroy`);
      } catch (e) {
        // Fallback: just set to air
        block.setType("minecraft:air");
      }
    });
    return;
  }

  // Check if this block needs custom drop handling (normal mining behavior)
  if (NORMAL_DROPS.has(blockId)) {
    event.cancel = true;

    const dropInfo = NORMAL_DROPS.get(blockId);
    const location = block.location;
    const dimension = block.dimension;

    system.run(() => {
      try {
        // Set the block to air
        block.setType("minecraft:air");

        // Spawn the correct drop item if there is one
        if (dropInfo.item && dropInfo.max > 0) {
          const count = dropInfo.min === dropInfo.max
            ? dropInfo.min
            : Math.floor(Math.random() * (dropInfo.max - dropInfo.min + 1)) + dropInfo.min;

          if (count > 0) {
            const itemStack = new ItemStack(dropInfo.item, count);
            dimension.spawnItem(itemStack, {
              x: location.x + 0.5,
              y: location.y + 0.5,
              z: location.z + 0.5
            });
          }
        }
      } catch (e) {
        console.warn(`Coin Hoe: Failed to process ${blockId}: ${e}`);
      }
    });
    return;
  }

  // All other blocks break normally with default drops
});

// Give recipe notification on world load
world.afterEvents.worldInitialize.subscribe(() => {
  console.log("Coin Hoe addon loaded! Use /give @s coin:coin_hoe to get the item.");
});

// Command to give Coin Hoe (backup method)
world.afterEvents.chatSend.subscribe((event) => {
  const message = event.message.toLowerCase();
  if (message === "!coinhoe" || message === "!coin_hoe") {
    const player = event.sender;
    system.run(() => {
      player.runCommand("give @s coin:coin_hoe 1");
      player.sendMessage("\u00a76You received the Coin Hoe!");
    });
  }
});
