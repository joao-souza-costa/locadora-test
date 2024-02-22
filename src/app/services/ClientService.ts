import { clientsKey } from '../constants/localStorageKeys'
import { useAuthStore } from '../store/useAuthStore'
import useLocalStorage from '../utils/useLocalStorage'

const clientsStorage = useLocalStorage(clientsKey)

export interface iClient {
  id: number
  firstName: string
  lastName: string
  document: string
  email: string
  cellphone: string
  cep: string
  street: string
  neighborhood: string
  city: string
  state: string
  status: enumClientStatus
  rents: iRentMovie[]
}

export interface iRentMovie {
  name: string
  user: string
  status: enumRentStatus
  startDate: string
  deliveryDate: string
}

export enum enumClientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ALL = 'ALL'
}

export const STATUS_LABELS: { [key in enumClientStatus]: string } = {
  [enumClientStatus.ACTIVE]: 'Ativo',
  [enumClientStatus.INACTIVE]: 'Inativo',
  [enumClientStatus.ALL]: 'Todos'
}

export enum enumRentStatus {
  RENTED = 'RENTED',
  CLOSED = 'CLOSED'
}

export const STATUS_RENT_LABELS: { [key in enumRentStatus]: string } = {
  [enumRentStatus.RENTED]: 'Alugado',
  [enumRentStatus.CLOSED]: 'Devolvido'
}

export interface iGetAllClientsFilters
  extends Partial<Pick<iClient, 'document' | 'firstName' | 'status'>> {}

export default {
  create: async (params: Omit<iClient, 'id' | 'status' | 'rents'>) => {
    const clientBd = clientsStorage.get() as iClient[] | null

    const client = { ...params, id: Math.random(), status: enumClientStatus.ACTIVE, rents: [] }

    if (!clientBd) {
      clientsStorage.set([client])
      return Promise.resolve(client.id)
    }

    const hasEmail = clientBd?.find((client) => client.email === params.email)

    if (hasEmail) throw 'Email já cadastrado'

    const hasDocument = clientBd?.find((client) => client.document === params.document)

    if (hasDocument) throw 'CPF já cadastrado'

    clientBd.push(client)
    clientsStorage.set(clientBd)

    return Promise.resolve(client.id)
  },
  getAll: async (filters: iGetAllClientsFilters) => {
    const clientBd = clientsStorage.get() as iClient[] | null

    return clientBd?.reduce((acc, value) => {
      let hasFirstName = true
      let hasDocument = true
      let hasStatus = true

      if (filters.firstName) {
        hasFirstName = value.firstName.startsWith(filters.firstName)
      }
      if (filters.document) {
        hasDocument = value.document.startsWith(filters.document)
      }
      if (filters.status !== enumClientStatus.ALL) {
        hasStatus = filters.status === value.status
      }

      if (hasFirstName && hasDocument && hasStatus) {
        acc.push(value)
      }
      return acc
    }, [] as iClient[])
  },
  update: async (params: iClient) => {
    const clientBd = clientsStorage.get() as iClient[] | null

    const hasClient = clientBd?.find((client) => client.id === params.id)

    if (!hasClient) throw 'Cliente não existe'

    const filteredBd = clientBd?.filter((item) => item.id !== params.id)

    const hasEmail = filteredBd?.find((client) => client.email === params.email)

    if (hasEmail) throw 'Email já cadastrado'

    const hasDocument = filteredBd?.find((client) => client.document === params.document)

    if (hasDocument) throw 'CPF já cadastrado'

    filteredBd!.push({ ...hasClient, ...params })
    clientsStorage.set(filteredBd)

    return Promise.resolve(params.id)
  },
  addRent(params: { name: string; client: iClient; dates: Date[] }) {
    const clientBd = clientsStorage.get() as iClient[] | null
    const hasClient = clientBd?.find((client) => client.id === params.client.id)

    if (!hasClient) throw 'Cliente não existe'

    const hasActiveRent = hasClient.rents.find((movie) => movie.status === enumRentStatus.RENTED)

    if (hasActiveRent) throw 'Cliente já tem um aluguel vigente'

    const filteredBd = clientBd?.filter((item) => item.id !== params.client.id)

    const authStore = useAuthStore()
    hasClient.rents.push({
      name: params.name,
      user: authStore.user!.name,
      status: enumRentStatus.RENTED,
      startDate: params.dates[0].toISOString(),
      deliveryDate: params.dates[1].toISOString()
    })

    filteredBd?.push(hasClient)
    clientsStorage.set(filteredBd)

    return Promise.resolve(true)
  }
}
