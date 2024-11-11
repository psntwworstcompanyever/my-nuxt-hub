<template>
    <div>
        <h1>Board List</h1>
        <div>
            <UInput v-model="q" placeholder="Filter boards..." />
        </div>
        <div>
            <!-- Add .value to access the computed ref's value -->
            <UTable :rows="filteredBoards" :columns="columns" @select="handleRowClick" />
        </div>
        <div>
            <UModal v-model="popModal">
                <div class="p-4">
                    <h2>Board Details</h2>
                    <div v-if="selectedBoardTranspose">
                        <UTable :rows="selectedBoardTranspose" />
                        <UButton label="Choose this board" @click="goToBoardPage(selectedBoard)" />
                    </div>
                </div>
            </UModal>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const { data: boardsData } = await useFetch('/api/fetchBoards');
const boards = boardsData.value

const columns = [
    { key: 'pcba_sn', label: 'PCBA Serial Number' },
    { key: 'frame_size', label: 'Frame Size' },
    { key: 'mcu', label: 'MCU' }
];

// Filter array
const q = ref('')

const filteredBoards = computed(() => {
    if (!q.value) {
        return boards
    }

    return boards.filter((board) => {
        return Object.values(board).some((value) => {
            return String(value).toLowerCase().includes(q.value.toLowerCase())
        })
    })
})

// Popup card
const selectedBoardTranspose = ref([]);
const selectedBoard = ref(null);
const popModal = ref(false);

function handleRowClick(row) {
    selectedBoardTranspose.value = transformBoardToDetailFormat(row);
    selectedBoard.value = row
    popModal.value = true;
}

function transformBoardToDetailFormat(board) {
    return Object.entries(board).map(([key, value]) => ({
        item: key,
        description: value
    }));
}


// Create a shared state and navigate to another page
const useBoard = () => useState('board', () => null);
const sharedBoard = useBoard();

async function goToBoardPage(board) {
    // Store the student data in shared state
    sharedBoard.value = board;
    // Navigate to the student page
    await navigateTo(`/board/${board.pcba_sn}`);
}
</script>
