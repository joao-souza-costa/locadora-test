<template>
  <base-modal
    class="max-w-[500px]"
    v-if="isOpen"
    title="Alugar filme"
    open
    @update:open="$emit('close')"
  >
    <movie-form @submit="onSubmit" :initial-values="{ name: movie?.Title }">
      <base-button class="w-full" type="submit"> Salvar </base-button>
    </movie-form>
  </base-modal>
</template>

<script setup lang="ts">
import BaseModal from '@/components/BaseModal.vue'
import MovieForm from '../components/MovieForm.vue'
import BaseButton from '@/components/BaseButton.vue'
import type { iMovie } from '@/app/services/MovieService'
import { useRentalStore } from '@/app/store/useRentalStore'
import { toast } from '@/app/utils/toast'
import type { iAddRentalStatusParams } from '@/app/services/RentalService'
defineProps<{ isOpen: boolean; movie?: iMovie }>()
const emit = defineEmits<{ close: [] }>()

const rentalStore = useRentalStore()

const onSubmit = ({ name, dates, clientId }: iAddRentalStatusParams) => {
  rentalStore
    .createRental({ name, dates, clientId })
    .then(() => toast.success('Filme alugado com sucesso'))
    .then(() => emit('close'))
    .catch((e: ErrorEvent) => toast.error(e.message || 'Erro ao alugar filme'))
}
</script>

<style scoped></style>
