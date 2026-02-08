import { world, system, EquipmentSlot } from "@minecraft/server";

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

  // Block breaks normally with default drops
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
