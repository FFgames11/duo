<script setup>
import { computed } from "vue";

const ROWS = 11;
const COLS = 5;

const props = defineProps({
    theme: {
        type: Object,
        default: () => ({}),
    },
    entities: {
        type: Array,
        default: () => [],
    },
    activeEntityId: {
        type: String,
        default: "",
    },
    activeSpeech: {
        type: String,
        default: "",
    },
    activeSpeechEntityId: {
        type: String,
        default: "",
    },
    completedEntityIds: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(["entity-click"]);

const themeKeyMap = {
    tileColorA: "--tile-color-a",
    tileColorB: "--tile-color-b",
    boardBg: "--board-bg",
    zoneTopBg: "--zone-top-bg",
    zoneBottomBg: "--zone-bottom-bg",
    zoneLeftBg: "--zone-left-bg",
    zoneRightBg: "--zone-right-bg",
};

const boardRows = computed(() =>
    Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => ({
            row,
            col,
            isA: (row + col) % 2 === 0,
            label: `Tile ${row + 1}:${col + 1}`,
        })),
    ),
);

const entityMap = computed(() => {
    const mapped = {};

    for (const entity of props.entities) {
        mapped[`${entity.row - 1}-${entity.col - 1}`] = entity;
    }

    return mapped;
});

const completedSet = computed(() => new Set(props.completedEntityIds));

const themeVars = computed(() => {
    const vars = {};

    for (const [key, value] of Object.entries(props.theme)) {
        if (value == null) {
            continue;
        }

        const varName = key.startsWith("--") ? key : themeKeyMap[key];
        if (varName) {
            vars[varName] = value;
        }
    }

    return vars;
});

const onEntityClick = (entity) => {
    emit("entity-click", entity);
};

const getEntity = (row, col) => entityMap.value[`${row}-${col}`];
const isCompleted = (entityId) => completedSet.value.has(entityId);
const isActive = (entityId) => {
    if (props.activeSpeechEntityId) {
        return props.activeSpeechEntityId === entityId;
    }
    return props.activeEntityId === entityId;
};

const hasActiveSpeech = (row, col) => {
    const entity = getEntity(row, col);
    return Boolean(entity && props.activeSpeech && isActive(entity.id));
};

const activeSpeechEntity = computed(
    () =>
        props.entities.find(
            (entity) => entity.id === props.activeSpeechEntityId,
        ) ?? null,
);

const speechBubbleStyle = computed(() => {
    if (!activeSpeechEntity.value) {
        return {};
    }

    const left = ((activeSpeechEntity.value.col - 0.5) / COLS) * 100;
    const top = ((activeSpeechEntity.value.row - 1) / ROWS) * 100;

    return {
        left: `${left}%`,
        top: `${Math.max(top, 2)}%`,
    };
});
</script>

<template>
    <section class="mobile-board" :style="themeVars">
        <header class="zone zone-top">
            <slot name="top" />
        </header>

        <aside class="zone zone-left">
            <slot name="left" />
        </aside>

        <main class="board-wrap">
            <div class="board-surface">
                <div class="tile-grid" role="grid" aria-label="Tile board">
                    <template v-for="(rowTiles, row) in boardRows" :key="row">
                        <div
                            v-for="tile in rowTiles"
                            :key="`${tile.row}-${tile.col}`"
                            class="tile"
                            :class="[
                                tile.isA ? 'tile-a' : 'tile-b',
                                {
                                    'tile-active': hasActiveSpeech(
                                        tile.row,
                                        tile.col,
                                    ),
                                },
                            ]"
                            role="gridcell"
                            :aria-label="tile.label"
                        >
                            <span class="tile-label">{{ tile.label }}</span>
                            <div
                                v-if="getEntity(tile.row, tile.col)"
                                class="tile-entity"
                            >
                                <button
                                    type="button"
                                    class="entity-button"
                                    @click.stop="
                                        onEntityClick(
                                            getEntity(tile.row, tile.col),
                                        )
                                    "
                                >
                                    <img
                                        v-if="
                                            getEntity(tile.row, tile.col)
                                                .assetSrc
                                        "
                                        class="entity-asset"
                                        :src="
                                            getEntity(tile.row, tile.col)
                                                .assetSrc
                                        "
                                        :alt="
                                            getEntity(tile.row, tile.col)
                                                .name || 'animal'
                                        "
                                    />
                                    <span v-else class="entity-emoji">{{
                                        getEntity(tile.row, tile.col).emoji
                                    }}</span>
                                    <span
                                        v-if="
                                            !isCompleted(
                                                getEntity(tile.row, tile.col)
                                                    .id,
                                            )
                                        "
                                        class="entity-alert"
                                    >
                                        !
                                    </span>
                                </button>
                            </div>
                        </div>
                    </template>
                </div>
                <div
                    v-if="activeSpeechEntity && activeSpeech"
                    class="speech-overlay"
                >
                    <div class="speech-bubble" :style="speechBubbleStyle">
                        {{ activeSpeech }}
                    </div>
                </div>
            </div>
        </main>

        <aside class="zone zone-right">
            <slot name="right" />
        </aside>

        <footer class="zone zone-bottom">
            <slot name="bottom" />
        </footer>
    </section>
</template>

<style scoped>
.mobile-board {
    --tile-color-a: #87ceeb;
    --tile-color-b: #5ea6d1;
    --board-bg: #143249;
    --zone-top-bg: #0f2435;
    --zone-bottom-bg: #0f2435;
    --zone-left-bg: #10283b;
    --zone-right-bg: #10283b;
    --tile-label-color: rgba(10, 24, 39, 0.8);
    --side-zone-width: clamp(34px, 10vw, 60px);
    --board-padding: 0px;
    --board-fit: 1;

    width: 100%;
    height: 100svh;
    display: grid;
    grid-template-columns: var(--side-zone-width) minmax(0, 1fr) var(
            --side-zone-width
        );
    grid-template-rows: minmax(0, 1fr) auto minmax(0, 1fr);
    grid-template-areas:
        "top top top"
        "left board right"
        "bottom bottom bottom";
    overflow: visible;
    touch-action: manipulation;
}

.zone {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
    line-height: 1;
}

.zone-top {
    grid-area: top;
    background: var(--zone-top-bg);
    width: 100%;
    position: relative;
    z-index: 20;
    overflow: visible;
}

.zone-bottom {
    grid-area: bottom;
    background: var(--zone-bottom-bg);
    width: 100%;
}

.zone-left {
    grid-area: left;
    background: var(--zone-left-bg);
    padding: 8px 4px;
}

.zone-right {
    grid-area: right;
    background: var(--zone-right-bg);
    padding: 8px 4px;
}

.board-wrap {
    grid-area: board;
    display: grid;
    place-items: center;
    padding: var(--board-padding);
    overflow: visible;
    position: relative;
    z-index: 1;
}

.board-surface {
    position: relative;
    display: block;
    line-height: 0;
    width: min(
        calc(100% * var(--board-fit)),
        calc(100svh * (5 / 11) * var(--board-fit))
    );
    aspect-ratio: 5 / 11;
    background: transparent;
    border: 0;
    border-radius: 0;
    padding: 0;
}

.tile-grid {
    width: 100%;
    height: 100%;
    display: grid;
    gap: 0;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    grid-template-rows: repeat(11, minmax(0, 1fr));
    position: relative;
    overflow: visible;
}

.tile {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0 !important;
    outline: 0;
    box-shadow: none;
    appearance: none;
    border-radius: 0;
    margin: 0;
    padding: 0;
    line-height: 1;
    text-align: center;
    color: var(--tile-label-color);
    font-size: clamp(7px, 2.1vw, 11px);
    font-weight: 700;
    -webkit-tap-highlight-color: transparent;
    overflow: hidden;
    transform: translateZ(0);
    backface-visibility: hidden;
}

.tile-a {
    background: var(--tile-color-a);
}

.tile-b {
    background: var(--tile-color-b);
}

.tile-active {
    z-index: 100;
}

.tile::before {
    content: "";
    position: absolute;
    inset: -0.8px;
    background: inherit;
    z-index: 0;
}

.tile > * {
    position: relative;
    z-index: 1;
}

.tile:focus,
.tile:focus-visible {
    outline: 0;
    box-shadow: none;
}

.tile-label {
    padding: 1px;
}

.tile-entity {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    pointer-events: none;
}

.entity-button {
    position: relative;
    border: 0;
    background: transparent;
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
}

.entity-emoji {
    font-size: clamp(24px, 6.6vw, 40px);
    line-height: 1;
    cursor: pointer;
    pointer-events: auto;
}

.entity-asset {
    width: 70%;
    height: 70%;
    min-width: 20px;
    min-height: 20px;
    max-width: 34px;
    max-height: 34px;
    object-fit: contain;
    cursor: pointer;
    pointer-events: auto;
}

.entity-alert {
    position: absolute;
    top: 2px;
    right: 2px;
    color: #ffffff;
    background: #da3a2a;
    border-radius: 999px;
    width: 10px;
    height: 10px;
    display: grid;
    place-items: center;
    font-size: 8px;
    font-weight: 800;
}

.speech-overlay {
    position: absolute;
    inset: 0;
    overflow: visible;
    pointer-events: none;
    z-index: 9999;
}

.speech-bubble {
    position: absolute;
    transform: translate(-50%, calc(-100% - 10px));
    min-width: 72px;
    max-width: min(150px, calc(100vw - 40px));
    padding: 7px 9px;
    border-radius: 10px;
    background: #ffffff;
    color: #1d1d1d;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.3;
    text-align: center;
    z-index: 40;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.3);
    pointer-events: none;
}

.speech-bubble::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 7px 6px 0 6px;
    border-style: solid;
    border-color: #ffffff transparent transparent transparent;
}

@media (max-width: 430px) {
    .tile {
        font-size: clamp(9px, 2.8vw, 13px);
    }

    .entity-emoji {
        font-size: clamp(30px, 9vw, 48px);
    }

    .entity-asset {
        width: 84%;
        height: 84%;
        max-width: 48px;
        max-height: 48px;
    }

    .speech-bubble {
        min-width: 76px;
        max-width: 156px;
        padding: 8px 10px;
        font-size: 11px;
    }
}
</style>
