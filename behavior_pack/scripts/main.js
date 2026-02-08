import { world, system, ItemStack, EquipmentSlot } from "@minecraft/server";

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

// Blocks that should drop themselves (silk touch behavior)
const SILK_TOUCH_OVERRIDES = new Map([
  ["minecraft:stone", "minecraft:stone"],
  ["minecraft:coal_ore", "minecraft:coal_ore"],
  ["minecraft:iron_ore", "minecraft:iron_ore"],
  ["minecraft:copper_ore", "minecraft:copper_ore"],
  ["minecraft:gold_ore", "minecraft:gold_ore"],
  ["minecraft:diamond_ore", "minecraft:diamond_ore"],
  ["minecraft:lapis_ore", "minecraft:lapis_ore"],
  ["minecraft:redstone_ore", "minecraft:redstone_ore"],
  ["minecraft:emerald_ore", "minecraft:emerald_ore"],
  ["minecraft:nether_quartz_ore", "minecraft:nether_quartz_ore"],
  ["minecraft:nether_gold_ore", "minecraft:nether_gold_ore"],
  ["minecraft:ancient_debris", "minecraft:ancient_debris"],
  ["minecraft:deepslate_coal_ore", "minecraft:deepslate_coal_ore"],
  ["minecraft:deepslate_iron_ore", "minecraft:deepslate_iron_ore"],
  ["minecraft:deepslate_copper_ore", "minecraft:deepslate_copper_ore"],
  ["minecraft:deepslate_gold_ore", "minecraft:deepslate_gold_ore"],
  ["minecraft:deepslate_diamond_ore", "minecraft:deepslate_diamond_ore"],
  ["minecraft:deepslate_lapis_ore", "minecraft:deepslate_lapis_ore"],
  ["minecraft:deepslate_redstone_ore", "minecraft:deepslate_redstone_ore"],
  ["minecraft:deepslate_emerald_ore", "minecraft:deepslate_emerald_ore"],
  ["minecraft:grass_block", "minecraft:grass_block"],
  ["minecraft:mycelium", "minecraft:mycelium"],
  ["minecraft:podzol", "minecraft:podzol"],
  ["minecraft:ice", "minecraft:ice"],
  ["minecraft:blue_ice", "minecraft:blue_ice"],
  ["minecraft:packed_ice", "minecraft:packed_ice"],
  ["minecraft:glass", "minecraft:glass"],
  ["minecraft:glass_pane", "minecraft:glass_pane"],
  ["minecraft:glowstone", "minecraft:glowstone"],
  ["minecraft:sea_lantern", "minecraft:sea_lantern"],
  ["minecraft:melon_block", "minecraft:melon_block"],
  ["minecraft:bookshelf", "minecraft:bookshelf"],
  ["minecraft:bee_nest", "minecraft:bee_nest"],
  ["minecraft:beehive", "minecraft:beehive"],
  ["minecraft:campfire", "minecraft:campfire"],
  ["minecraft:soul_campfire", "minecraft:soul_campfire"],
  ["minecraft:turtle_egg", "minecraft:turtle_egg"],
  ["minecraft:snow", "minecraft:snow"],
  ["minecraft:clay", "minecraft:clay"],
  ["minecraft:gravel", "minecraft:gravel"],
  ["minecraft:infested_stone", "minecraft:stone"],
  ["minecraft:infested_cobblestone", "minecraft:cobblestone"],
  ["minecraft:infested_stone_bricks", "minecraft:stonebrick"],
  ["minecraft:infested_mossy_stone_bricks", "minecraft:mossy_stone_bricks"],
  ["minecraft:infested_cracked_stone_bricks", "minecraft:cracked_stone_bricks"],
  ["minecraft:infested_chiseled_stone_bricks", "minecraft:chiseled_stone_bricks"],
  ["minecraft:infested_deepslate", "minecraft:deepslate"],
  ["minecraft:budding_amethyst", "minecraft:budding_amethyst"],
  ["minecraft:amethyst_cluster", "minecraft:amethyst_cluster"],
  ["minecraft:large_amethyst_bud", "minecraft:large_amethyst_bud"],
  ["minecraft:medium_amethyst_bud", "minecraft:medium_amethyst_bud"],
  ["minecraft:small_amethyst_bud", "minecraft:small_amethyst_bud"],
  ["minecraft:sculk", "minecraft:sculk"],
  ["minecraft:sculk_catalyst", "minecraft:sculk_catalyst"],
  ["minecraft:sculk_sensor", "minecraft:sculk_sensor"],
  ["minecraft:sculk_shrieker", "minecraft:sculk_shrieker"],
  ["minecraft:sculk_vein", "minecraft:sculk_vein"]
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

// Subscribe to block break events for silk touch behavior
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

  // Check if this block needs silk touch override
  if (SILK_TOUCH_OVERRIDES.has(blockId)) {
    event.cancel = true;

    const dropBlockId = SILK_TOUCH_OVERRIDES.get(blockId);
    const location = block.location;
    const dimension = block.dimension;

    system.run(() => {
      try {
        // Set the block to air
        block.setType("minecraft:air");

        // Spawn the silk touched block as an item
        const itemStack = new ItemStack(dropBlockId, 1);
        dimension.spawnItem(itemStack, {
          x: location.x + 0.5,
          y: location.y + 0.5,
          z: location.z + 0.5
        });
      } catch (e) {
        console.warn(`Coin Hoe: Failed to process ${blockId}: ${e}`);
      }
    });
  }
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
