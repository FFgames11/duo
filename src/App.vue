<script setup>
import {
    computed,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
    watchEffect,
} from "vue";
import MobileTileBoard from "./components/MobileTileBoard.vue";

const selectedTheme = ref("zoo");
const isThemeMenuOpen = ref(false);
const activeEntityId = ref("");
const completedByTheme = ref({
    zoo: [],
    school: [],
    grocery: [],
});
const showQuestionSheet = ref(false);
const answerFeedback = ref("");
const answerStatus = ref("idle");
const disabledChoiceIndexes = ref([]);
const selectedCorrectIndex = ref(-1);
const activeChoices = ref([]);
const activeCorrectIndex = ref(-1);
const activeSpeechEntityId = ref("");
const activeSpeechText = ref("");
let activeAudio = null;
let closeTimer = null;

const entitiesByTheme = {
    zoo: [
        {
            id: "lion",
            name: "Lion",
            emoji: "🦁",
            assetSrc: "",
            ttsFile: "Lion.mp3",
            row: 1,
            col: 1,
            phrase: "I am hungry and want meat for lunch.",
            question: "Which food should the lion eat?",
            choices: ["Steak", "Carrot", "Bread", "Orange"],
            correctIndex: 0,
        },
        {
            id: "elephant",
            name: "Elephant",
            emoji: "🐘",
            assetSrc: "",
            ttsFile: "Elephant.mp3",
            row: 2,
            col: 4,
            phrase: "I need lots of water after my walk.",
            question: "What does the elephant need now?",
            choices: ["Water", "Soda", "Coffee", "Juice"],
            correctIndex: 0,
        },
        {
            id: "monkey",
            name: "Monkey",
            emoji: "🐵",
            assetSrc: "",
            ttsFile: "Monkey.mp3",
            row: 4,
            col: 2,
            phrase: "I found a banana tree near the river.",
            question: "What fruit did the monkey find?",
            choices: ["Banana", "Apple", "Grape", "Pear"],
            correctIndex: 0,
        },
        {
            id: "giraffe",
            name: "Giraffe",
            emoji: "🦒",
            assetSrc: "",
            ttsFile: "Giraffe.mp3",
            row: 6,
            col: 5,
            phrase: "I can reach the highest leaves easily.",
            question: "Which leaves can the giraffe reach?",
            choices: [
                "High leaves",
                "Only fallen leaves",
                "Roots",
                "Ground grass",
            ],
            correctIndex: 0,
        },
        {
            id: "penguin",
            name: "Penguin",
            emoji: "🐧",
            assetSrc: "",
            ttsFile: "Penguin.mp3",
            row: 8,
            col: 3,
            phrase: "I like cold places and slippery ice.",
            question: "What place does the penguin prefer?",
            choices: ["Cold place", "Hot desert", "Dry volcano", "Sunny beach"],
            correctIndex: 0,
        },
        {
            id: "zebra",
            name: "Zebra",
            emoji: "🦓",
            assetSrc: "",
            ttsFile: "Zebra.mp3",
            row: 10,
            col: 1,
            phrase: "My black and white stripes help me hide.",
            question: "What pattern does the zebra have?",
            choices: [
                "Black and white stripes",
                "Solid brown fur",
                "Red spots",
                "Blue lines",
            ],
            correctIndex: 0,
        },
    ],
    school: [
        {
            id: "teacher",
            name: "Teacher",
            emoji: "👩‍🏫",
            assetSrc: "",
            ttsFile: "Teacher.mp3",
            row: 1,
            col: 2,
            phrase: "Class starts after the school bell rings.",
            question: "What starts class time?",
            choices: ["School bell", "Lunch bell", "Phone ringtone", "Whistle"],
            correctIndex: 0,
        },
        {
            id: "student-a",
            name: "Student A",
            emoji: "🧑‍🎓",
            assetSrc: "",
            ttsFile: "Student.mp3",
            row: 3,
            col: 5,
            phrase: "I use a pencil to write in my notebook.",
            question: "What does the student use to write?",
            choices: ["Pencil", "Fork", "Brush", "Plate"],
            correctIndex: 0,
        },
        {
            id: "book",
            name: "Book",
            emoji: "📘",
            assetSrc: "",
            ttsFile: "Book.mp3",
            row: 5,
            col: 1,
            phrase: "This book is for reading practice.",
            question: "What is this book for?",
            choices: ["Reading", "Cooking", "Swimming", "Driving"],
            correctIndex: 0,
        },
        {
            id: "board",
            name: "Whiteboard",
            emoji: "🧾",
            assetSrc: "",
            ttsFile: "Whiteboard.mp3",
            row: 6,
            col: 3,
            phrase: "The lesson notes are written on the board.",
            question: "Where are lesson notes written?",
            choices: [
                "On the board",
                "On the floor",
                "On the window",
                "On shoes",
            ],
            correctIndex: 0,
        },
        {
            id: "student-b",
            name: "Student B",
            emoji: "🙋",
            assetSrc: "",
            ttsFile: "Student B.mp3",
            row: 8,
            col: 4,
            phrase: "I raise my hand when I want to answer.",
            question: "What should you do before answering?",
            choices: ["Raise your hand", "Run outside", "Shout loudly", "Hide"],
            correctIndex: 0,
        },
        {
            id: "clock",
            name: "Class Clock",
            emoji: "🕒",
            assetSrc: "",
            ttsFile: "Class Clock.mp3",
            row: 10,
            col: 2,
            phrase: "The school clock helps us track class time.",
            question: "What helps track class time?",
            choices: ["Clock", "Pillow", "Ball", "Hat"],
            correctIndex: 0,
        },
    ],
    grocery: [
        {
            id: "apple",
            name: "Apple",
            emoji: "🍎",
            assetSrc: "",
            ttsFile: "Apple.mp3",
            row: 2,
            col: 4,
            phrase: "Fresh apples are in the fruit aisle.",
            question: "Where are the apples?",
            choices: ["Fruit aisle", "Freezer", "Checkout desk", "Parking lot"],
            correctIndex: 0,
        },
        {
            id: "milk",
            name: "Milk",
            emoji: "🥛",
            assetSrc: "",
            ttsFile: "Milk.mp3",
            row: 2,
            col: 1,
            phrase: "Keep milk cold in the fridge section.",
            question: "Where should milk be kept?",
            choices: [
                "Fridge section",
                "Bakery shelf",
                "Toy shelf",
                "Entrance",
            ],
            correctIndex: 0,
        },
        {
            id: "bread",
            name: "Bread",
            emoji: "🍞",
            assetSrc: "",
            ttsFile: "Bread.mp3",
            row: 4,
            col: 4,
            phrase: "Bread is usually found near the bakery.",
            question: "Where do you find bread?",
            choices: ["Near bakery", "Car wash", "Bus stop", "Office"],
            correctIndex: 0,
        },
        {
            id: "cart",
            name: "Shopping Cart",
            emoji: "🛒",
            assetSrc: "",
            ttsFile: "Shopping Cart.mp3",
            row: 6,
            col: 2,
            phrase: "Use a cart to carry many items.",
            question: "What helps carry many items?",
            choices: ["Shopping cart", "Pencil case", "Spoon", "Umbrella"],
            correctIndex: 0,
        },
        {
            id: "cashier",
            name: "Cashier",
            emoji: "💳",
            assetSrc: "",
            ttsFile: "Cashier.mp3",
            row: 8,
            col: 5,
            phrase: "Payment is done at the checkout counter.",
            question: "Where do you pay?",
            choices: [
                "Checkout counter",
                "Parking lot",
                "Storage room",
                "Stairs",
            ],
            correctIndex: 0,
        },
        {
            id: "bag",
            name: "Grocery Bag",
            emoji: "🛍️",
            assetSrc: "",
            ttsFile: "Grocery Bag.mp3",
            row: 10,
            col: 3,
            phrase: "Use a bag to take groceries home.",
            question: "What do you use to carry groceries home?",
            choices: ["Bag", "Notebook", "Ruler", "Remote"],
            correctIndex: 0,
        },
    ],
};

const themes = {
    zoo: {
        appBg: "#0f291b",
        appText: "#edf7ef",
        sheetBg: "#234428",
        sheetText: "#edf7ef",
        tileColorA: "#b7d77b",
        tileColorB: "#8fbf5f",
        tileBorderColor: "#5e8a3e",
        zoneTopBg: "#234428",
        zoneBottomBg: "#234428",
        zoneLeftBg: "#1d3a25",
        zoneRightBg: "#1d3a25",
        tileLabelColor: "#1f3416",
    },
    school: {
        appBg: "#11233f",
        appText: "#f2f6ff",
        sheetBg: "#1b3b6d",
        sheetText: "#f2f6ff",
        tileColorA: "#d8e5ff",
        tileColorB: "#b9cdf4",
        tileBorderColor: "#7a95c2",
        zoneTopBg: "#1b3b6d",
        zoneBottomBg: "#1b3b6d",
        zoneLeftBg: "#173156",
        zoneRightBg: "#173156",
        tileLabelColor: "#1a2f52",
    },
    grocery: {
        appBg: "#2a1e12",
        appText: "#fff7ea",
        sheetBg: "#6a8f43",
        sheetText: "#fff7ea",
        tileColorA: "#ffd9a8",
        tileColorB: "#f4bd7a",
        tileBorderColor: "#ba8042",
        zoneTopBg: "#6a8f43",
        zoneBottomBg: "#6a8f43",
        zoneLeftBg: "#567a34",
        zoneRightBg: "#567a34",
        tileLabelColor: "#5d3414",
    },
};

const activeTheme = computed(() => themes[selectedTheme.value] ?? themes.zoo);
const themeLabelMap = {
    zoo: "Zoo",
    school: "School",
    grocery: "Grocery",
};
const selectedThemeLabel = computed(
    () => themeLabelMap[selectedTheme.value] ?? "Zoo",
);
const currentEntities = computed(
    () => entitiesByTheme[selectedTheme.value] ?? [],
);
const activeEntity = computed(() =>
    currentEntities.value.find((item) => item.id === activeEntityId.value),
);
const completedEntityIds = computed(
    () => completedByTheme.value[selectedTheme.value] ?? [],
);

const boardTheme = computed(() => ({
    tileColorA: activeTheme.value.tileColorA,
    tileColorB: activeTheme.value.tileColorB,
    tileBorderColor: activeTheme.value.tileBorderColor,
    zoneTopBg: activeTheme.value.zoneTopBg,
    zoneBottomBg: activeTheme.value.zoneBottomBg,
    zoneLeftBg: activeTheme.value.zoneLeftBg,
    zoneRightBg: activeTheme.value.zoneRightBg,
    "--tile-label-color": activeTheme.value.tileLabelColor,
}));

const questionSheetStyle = computed(() => ({
    "--sheet-bg": activeTheme.value.sheetBg,
    "--sheet-text": activeTheme.value.sheetText,
}));

watchEffect(() => {
    document.documentElement.style.setProperty(
        "--app-bg",
        activeTheme.value.appBg,
    );
    document.documentElement.style.setProperty(
        "--app-text",
        activeTheme.value.appText,
    );
});

const onEntityClick = (entity) => {
    const clickedEntity = currentEntities.value.find(
        (item) => item.id === entity?.id,
    );
    if (!clickedEntity || completedEntityIds.value.includes(clickedEntity.id)) {
        return;
    }

    activeEntityId.value = clickedEntity.id;
    showQuestionSheet.value = false;
    answerFeedback.value = "";
    answerStatus.value = "idle";
    disabledChoiceIndexes.value = [];
    selectedCorrectIndex.value = -1;
    activeChoices.value = [];
    activeCorrectIndex.value = -1;

    const indexedChoices = clickedEntity.choices.map((choice, index) => ({
        choice,
        index,
        sortKey: Math.random(),
    }));
    indexedChoices.sort((a, b) => a.sortKey - b.sortKey);
    activeChoices.value = indexedChoices.map((item) => item.choice);
    activeCorrectIndex.value = indexedChoices.findIndex(
        (item) => item.index === clickedEntity.correctIndex,
    );
    activeSpeechEntityId.value = clickedEntity.id;
    activeSpeechText.value = clickedEntity.phrase;

    if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
    }

    const audioSrc = `/tts/${encodeURIComponent(clickedEntity.ttsFile || "")}`;
    const audio = new Audio(audioSrc);
    activeAudio = audio;

    audio.onended = () => {
        if (activeAudio !== audio) {
            return;
        }
        activeSpeechEntityId.value = "";
        activeSpeechText.value = "";
        showQuestionSheet.value = true;
    };

    audio.onerror = () => {
        if (activeAudio !== audio) {
            return;
        }
        activeSpeechEntityId.value = "";
        activeSpeechText.value = "";
        showQuestionSheet.value = true;
    };

    audio.play().catch(() => {
        if (activeAudio !== audio) {
            return;
        }
        activeSpeechEntityId.value = "";
        activeSpeechText.value = "";
        showQuestionSheet.value = true;
    });
};

const onAnswer = (choiceIndex) => {
    if (!activeEntity.value) {
        return;
    }

    if (answerStatus.value === "correct") {
        return;
    }

    if (disabledChoiceIndexes.value.includes(choiceIndex)) {
        return;
    }

    if (choiceIndex === activeCorrectIndex.value) {
        answerFeedback.value = "Correct!";
        answerStatus.value = "correct";
        selectedCorrectIndex.value = choiceIndex;

        if (closeTimer) {
            clearTimeout(closeTimer);
        }

        closeTimer = setTimeout(() => {
            completedByTheme.value = {
                ...completedByTheme.value,
                [selectedTheme.value]: [
                    ...completedEntityIds.value,
                    activeEntity.value.id,
                ],
            };
            closeQuestionSheet();
        }, 1500);
        return;
    }

    answerFeedback.value = "Not correct. Try again.";
    answerStatus.value = "wrong";
    disabledChoiceIndexes.value = [...disabledChoiceIndexes.value, choiceIndex];
};

const closeQuestionSheet = () => {
    showQuestionSheet.value = false;
    answerFeedback.value = "";
    answerStatus.value = "idle";
    disabledChoiceIndexes.value = [];
    selectedCorrectIndex.value = -1;
    activeChoices.value = [];
    activeCorrectIndex.value = -1;
    activeSpeechEntityId.value = "";
    activeSpeechText.value = "";
    activeEntityId.value = "";

    if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
        activeAudio = null;
    }
};

const toggleThemeMenu = () => {
    isThemeMenuOpen.value = !isThemeMenuOpen.value;
};

const chooseTheme = (theme) => {
    selectedTheme.value = theme;
    isThemeMenuOpen.value = false;
};

const handleWindowClick = (event) => {
    if (!event.target.closest(".theme-menu")) {
        isThemeMenuOpen.value = false;
    }
};

watch(selectedTheme, () => {
    closeQuestionSheet();
    if (closeTimer) {
        clearTimeout(closeTimer);
    }
});

onMounted(() => {
    window.addEventListener("click", handleWindowClick);
});

onBeforeUnmount(() => {
    if (closeTimer) {
        clearTimeout(closeTimer);
    }
    if (activeAudio) {
        activeAudio.pause();
        activeAudio = null;
    }
    window.removeEventListener("click", handleWindowClick);
});
</script>

<template>
    <MobileTileBoard
        :theme="boardTheme"
        :entities="currentEntities"
        :active-entity-id="activeEntityId"
        :active-speech="activeSpeechText"
        :active-speech-entity-id="activeSpeechEntityId"
        :completed-entity-ids="completedEntityIds"
        @entity-click="onEntityClick"
    >
        <template #top>
            <div class="top-controls theme-menu">
                <span class="theme-label">Theme</span>
                <button
                    class="theme-trigger"
                    type="button"
                    @click.stop="toggleThemeMenu"
                >
                    {{ selectedThemeLabel }}
                    <span class="theme-caret" :class="{ open: isThemeMenuOpen }"
                        >▾</span
                    >
                </button>
                <Transition name="menu-pop">
                    <div v-if="isThemeMenuOpen" class="theme-options">
                        <button
                            type="button"
                            class="theme-option"
                            :class="{ active: selectedTheme === 'zoo' }"
                            @click="chooseTheme('zoo')"
                        >
                            Zoo
                        </button>
                        <button
                            type="button"
                            class="theme-option"
                            :class="{ active: selectedTheme === 'school' }"
                            @click="chooseTheme('school')"
                        >
                            School
                        </button>
                        <button
                            type="button"
                            class="theme-option"
                            :class="{ active: selectedTheme === 'grocery' }"
                            @click="chooseTheme('grocery')"
                        >
                            Grocery
                        </button>
                    </div>
                </Transition>
            </div>
        </template>

        <template #left>
            <span>left wall</span>
        </template>

        <template #right>
            <span>right wall</span>
        </template>

        <template #bottom>
            <strong>bottom wall</strong>
        </template>
    </MobileTileBoard>

    <Transition name="sheet-backdrop">
        <div
            v-if="showQuestionSheet && activeEntity"
            class="sheet-backdrop"
            @click="closeQuestionSheet"
        ></div>
    </Transition>

    <Transition name="bottom-sheet">
        <section
            v-if="showQuestionSheet && activeEntity"
            class="question-sheet"
            :style="questionSheetStyle"
        >
            <div class="sheet-handle" aria-hidden="true"></div>
            <div class="sheet-prompt">
                <span class="sheet-emoji">{{ activeEntity.emoji }}</span>
                <div class="sheet-copy">
                    <p class="sheet-sentence">"{{ activeEntity.phrase }}"</p>
                    <p class="sheet-question">"{{ activeEntity.question }}"</p>
                </div>
            </div>
            <p v-if="answerFeedback" class="sheet-feedback">
                {{ answerFeedback }}
            </p>
            <div class="sheet-actions">
                <button
                    v-for="(choice, index) in activeChoices"
                    :key="`${activeEntity.id}-${index}`"
                    type="button"
                    class="sheet-btn"
                    :class="{
                        'sheet-btn-wrong':
                            disabledChoiceIndexes.includes(index),
                        'sheet-btn-correct':
                            answerStatus === 'correct' &&
                            selectedCorrectIndex === index,
                    }"
                    :disabled="disabledChoiceIndexes.includes(index)"
                    @click="onAnswer(index)"
                >
                    {{ choice }}
                </button>
            </div>
        </section>
    </Transition>
</template>

<style scoped>
.top-controls {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 6px 10px 8px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.16);
    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(4px);
    position: relative;
}

.theme-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    opacity: 0.92;
}

.theme-trigger {
    height: 30px;
    min-width: 112px;
    padding: 0 10px 0 12px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.25),
        rgba(255, 255, 255, 0.08)
    );
    color: inherit;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    transition:
        border-color 120ms ease,
        background-color 120ms ease;
}

.theme-trigger:hover {
    border-color: rgba(255, 255, 255, 0.8);
}

.theme-trigger:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.9);
    outline-offset: 2px;
}

.theme-caret {
    transition: transform 140ms ease;
}

.theme-caret.open {
    transform: rotate(180deg);
}

.theme-options {
    position: absolute;
    top: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    width: 132px;
    display: grid;
    gap: 4px;
    padding: 6px;
    border-radius: 10px;
    background: rgba(16, 16, 16, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35);
    z-index: 8;
}

.theme-option {
    height: 30px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 120ms ease;
}

.theme-option:hover {
    background: rgba(255, 255, 255, 0.16);
}

.theme-option.active {
    background: rgba(255, 255, 255, 0.24);
}

.menu-pop-enter-active,
.menu-pop-leave-active {
    transition:
        opacity 140ms ease,
        transform 140ms ease;
}

.menu-pop-enter-from,
.menu-pop-leave-to {
    opacity: 0;
    transform: translate(-50%, -4px);
}

.sheet-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.58);
    z-index: 29;
}

.question-sheet {
    position: fixed;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: min(100vw, 430px);
    border-radius: 16px 16px 0 0;
    min-height: 280px;
    padding: 24px 16px 36px;
    background: var(--sheet-bg, rgba(0, 0, 0, 0.92));
    color: var(--sheet-text, #ffffff);
    z-index: 30;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

.sheet-handle {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 46px;
    height: 5px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.45);
}

.sheet-prompt {
    display: grid;
    grid-template-columns: 46px 1fr;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
}

.sheet-copy {
    display: grid;
    gap: 4px;
}

.sheet-sentence {
    margin: 0;
    font-size: 14px;
    line-height: 1.3;
}

.sheet-emoji {
    width: 46px;
    height: 46px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.22);
    font-size: 28px;
    line-height: 1;
    padding: 0;
}

.sheet-question {
    margin: 0;
    font-size: 14px;
    line-height: 1.3;
    font-weight: 700;
}

.sheet-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    width: min(100%, 390px);
    margin: 18px auto 0;
}

.sheet-btn {
    height: 46px;
    border: 0;
    border-radius: 8px;
    background: #ffffff;
    color: #1f1f1f;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition:
        transform 120ms ease,
        box-shadow 120ms ease,
        filter 120ms ease;
}

.sheet-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

.sheet-btn:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.9);
    outline-offset: 2px;
}

.sheet-btn:active {
    transform: translateY(0);
    filter: brightness(0.95);
}

.sheet-feedback {
    margin: 0 0 12px;
    font-size: 13px;
    opacity: 1;
    font-weight: 700;
}

.sheet-btn-wrong {
    background: #d64545;
    color: #ffffff;
    opacity: 0.75;
    cursor: not-allowed;
}

.sheet-btn-correct {
    background: #4caf50;
    color: #ffffff;
}

.bottom-sheet-enter-active,
.bottom-sheet-leave-active {
    transition:
        transform 220ms ease,
        opacity 220ms ease;
}

.bottom-sheet-enter-from,
.bottom-sheet-leave-to {
    transform: translate(-50%, 100%);
    opacity: 0;
}

.bottom-sheet-enter-to,
.bottom-sheet-leave-from {
    transform: translate(-50%, 0%);
    opacity: 1;
}

.sheet-backdrop-enter-active,
.sheet-backdrop-leave-active {
    transition: opacity 220ms ease;
}

.sheet-backdrop-enter-from,
.sheet-backdrop-leave-to {
    opacity: 0;
}
</style>
