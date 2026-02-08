# Coin Hoe Addon

![Coin Hoe](coinhoe-logo-mc.png)

A Minecraft Bedrock Edition addon that adds the **Coin Hoe** - a special golden hoe that can break any block instantly with silk touch.

## Features

- **Instant Mining**: Breaks any block instantly, including obsidian, ancient debris, and even bedrock
- **Silk Touch**: All blocks drop themselves (ores drop ore blocks, glass doesn't shatter, etc.)
- **Golden Hoe Appearance**: Looks like a regular golden hoe
- **High Durability**: 9999 durability points

## Requirements

- Minecraft Bedrock Edition 1.20.0 or later
- **Beta APIs** experimental toggle enabled

## Installation

### Step 1: Add the Texture

Before installing, you need to add the golden hoe texture:

1. Copy the vanilla golden hoe texture from:
   ```
   Minecraft\data\resource_packs\vanilla\textures\items\gold_hoe.png
   ```
2. Paste it to:
   ```
   coin_hoe_addon\resource_pack\textures\items\coin_hoe.png
   ```

Or create your own 16x16 PNG texture.

### Step 2: Package the Addon

**Option A: Manual Installation**
1. Copy `behavior_pack` folder to:
   - Windows: `%localappdata%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\development_behavior_packs\`
2. Copy `resource_pack` folder to:
   - Windows: `%localappdata%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\development_resource_packs\`

**Option B: Create .mcaddon file**
1. Zip the `behavior_pack` folder and rename to `CoinHoe_BP.mcpack`
2. Zip the `resource_pack` folder and rename to `CoinHoe_RP.mcpack`
3. Zip both .mcpack files together and rename to `CoinHoe.mcaddon`
4. Double-click to install

### Step 3: Enable in World

1. Create a new world or edit existing world
2. Go to **Behavior Packs** → Add "Coin Hoe Behavior Pack"
3. Go to **Resource Packs** → Add "Coin Hoe Resource Pack"
4. Go to **Experiments** → Enable **Beta APIs**
5. Create/Play the world

## Usage

### Getting the Item

Use the give command:
```
/give @s coin:coin_hoe
```

Or type in chat:
```
!coinhoe
```

### Using the Item

Simply hold the Coin Hoe and break any block. It will:
- Break instantly (even bedrock!)
- Drop the block itself (silk touch effect)
- Not drop anything for technical blocks (bedrock, command blocks, etc.)

## Technical Details

| Property | Value |
|----------|-------|
| Item ID | `coin:coin_hoe` |
| Durability | 9999 |
| Stack Size | 1 |
| Enchantable | Yes (hoe slot) |

## Troubleshooting

**Item doesn't appear / Script not working:**
- Make sure "Beta APIs" experiment is enabled
- Check that both behavior and resource packs are active

**Blocks not breaking instantly:**
- Some modded blocks may not be covered
- Bedrock may require creative mode in some scenarios

**No texture showing:**
- Ensure `coin_hoe.png` exists in `resource_pack/textures/items/`

## License

Free to use, modify, and distribute.
