<template>
  <Panel>
    <template v-slot:header>
      <title>{{ __('logs') }}</title>
    </template>

    <template v-slot:content>
      <!-- Content header -->
      <div class="flex items-center justify-between px-4 py-2 text-primary-500 border-b md:py-4">
        <div class="flex">
          <Bars2Icon class="h-7 w-7 mx-3" />
          <h1 class="text-2xl font-semibold">
            {{ `${__('logs')}` }}
          </h1>
        </div>
        <div>
          <Link
            v-if="false"
            :href="route('admin.panel.room.create')"
            class="inline-flex items-center justify-center px-4 py-2 bg-green-500 border border-transparent rounded-md font-semibold transition-all duration-500 text-white hover:bg-green-600 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
          >
            {{ __('new_log') }}
          </Link>
        </div>
      </div>
      <!-- Content -->
      <div class="px-2 flex flex-col md:px-4">
        <div class="flex-col bg-white overflow-x-auto shadow-lg rounded-lg">
          <!--          search and table-->
          <div class="flex flex-wrap items-center justify-start gap-2 py-4 p-4">
            <!--              Dropdown Actions-->
            <div>
              <div class="relative mx-1" data-te-dropdown-ref>
                <button
                  id="dropdownActionsSetting"
                  data-te-dropdown-toggle-ref
                  aria-expanded="false"
                  data-te-ripple-init
                  data-te-ripple-color="light"
                  class="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-3 py-1.5"
                >
                  <span class="sr-only">table actions</span>
                  <span>{{ __('bulk_actions') }}</span>
                  <ChevronDownIcon class="h-4 w-4 mx-1" />
                </button>

                <!--     menu -->
                <div
                  ref="actionsMenu"
                  data-te-dropdown-menu-ref
                  class="min-w-[12rem] absolute z-[1000] float-start m-0 hidden min-w-max list-none overflow-hidden rounded-lg border-none bg-white bg-clip-padding text-start text-base shadow-lg [&[data-te-dropdown-show]]:block"
                  tabindex="-1"
                  role="menu"
                  aria-orientation="vertical"
                  aria-label="Actions menu"
                  aria-labelledby="dropdownActionsSetting"
                ></div>
              </div>
            </div>
            <!--              Dropdown Paginate-->
            <div class="flex items-center">
              <div class="relative mx-1" data-te-dropdown-ref>
                <button
                  id="dropdownPaginate"
                  data-te-dropdown-toggle-ref
                  aria-expanded="false"
                  data-te-ripple-init
                  data-te-ripple-color="light"
                  class="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-3 py-1.5"
                >
                  <span class="sr-only">table actions</span>
                  <span>{{ params.paginate }}</span>
                  <ChevronDownIcon class="h-4 w-4 mx-1" />
                </button>

                <!--     menu -->
                <div
                  ref="adminMenu"
                  data-te-dropdown-menu-ref
                  class="min-w-[12rem] absolute z-[1000] start-0 text-gray-500 m-0 hidden min-w-max list-none overflow-hidden rounded-lg border-none bg-white bg-clip-padding text-start text-base shadow-lg [&[data-te-dropdown-show]]:block"
                  tabindex="-1"
                  role="menu"
                  aria-orientation="vertical"
                  aria-label="User menu"
                  aria-labelledby="dropdownPaginate"
                >
                  <div v-for="num in $page.props.pageItems" class="">
                    <div
                      @click="(params.paginate = num), getData(1)"
                      role="menuitem"
                      class="cursor-pointer select-none block p-2 px-6 text-sm transition-colors hover:bg-gray-100"
                    >
                      {{ num }}
                    </div>
                    <hr class="border-gray-200" />
                  </div>
                </div>
              </div>

              <!--                Paginate-->
              <Pagination @paginationChanged="paginationChanged" :pagination="pagination" />
            </div>

            <div class="relative">
              <label for="table-search" class="sr-only">Search</label>
              <div
                class="absolute inset-y-0 cursor-pointer text-gray-500 hover:text-gray-700 start-0 flex items-center px-3"
              >
                <MagnifyingGlassIcon @click="getData()" class="w-4 h-4" />
              </div>
              <div
                class="absolute inset-y-0 end-0 text-gray-500 flex items-center px-3 cursor-pointer hover:text-gray-700"
                @click="(params.search = null), getData()"
              >
                <XMarkIcon class="w-4 h-4" />
              </div>
              <input
                type="text"
                id="table-search-admins"
                v-model="params.search"
                @keydown.enter="getData()"
                class="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                :placeholder="__('search')"
              />
            </div>
          </div>
          <div class="text-gray-500 text-sm px-4">
            {{ `${__('total')} ${total} ${__('item')}` }}
          </div>
          <!--           table-->
          <table class="w-full text-sm text-left text-gray-500">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50">
              <!--         table header-->
              <tr class="text-sm text-center">
                <th scope="col" class="p-4" @click="toggleAll">
                  <div class="flex items-center">
                    <input
                      id="checkbox-all-search"
                      type="checkbox"
                      v-model="toggleSelect"
                      class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label for="checkbox-all-search" class="sr-only">checkbox</label>
                  </div>
                </th>
                <th
                  scope="col"
                  class="px-2 py-3 cursor-pointer duration-300 hover:text-gray-500 hover:scale-[105%]"
                  @click="
                    (params.order_by = 'id'),
                      (params.dir = params.dir == 'ASC' ? 'DESC' : 'ASC'),
                      (params.page = 1),
                      getData()
                  "
                >
                  <div class="flex items-center justify-center">
                    <span class="px-2"> {{ __('id') }} </span>
                    <ArrowsUpDownIcon class="w-4 h-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  class="px-2 py-3 cursor-pointer duration-300 hover:text-gray-500 hover:scale-[105%]"
                  @click="
                    (params.order_by = 'date'),
                      (params.dir = params.dir == 'ASC' ? 'DESC' : 'ASC'),
                      (params.page = 1),
                      getData('clear')
                  "
                >
                  <div class="flex items-center justify-center">
                    <span class="px-2"> {{ __('date') }}</span>
                    <ArrowsUpDownIcon class="w-4 h-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  class="px-2 py-3 cursor-pointer duration-300 hover:text-gray-500 hover:scale-[105%]"
                  @click="
                    (params.order_by = 'type'),
                      (params.dir = params.dir == 'ASC' ? 'DESC' : 'ASC'),
                      (params.page = 1),
                      getData('clear')
                  "
                >
                  <div class="flex items-center justify-center">
                    <span class="px-2"> {{ __('room') }}</span>
                    <ArrowsUpDownIcon class="w-4 h-4" />
                  </div>
                </th>

                <th
                  scope="col"
                  class="px-2 py-3 cursor-pointer duration-300 hover:text-gray-500 hover:scale-[105%]"
                  @click="
                    (params.order_by = 'card_count'),
                      (params.dir = params.dir == 'ASC' ? 'DESC' : 'ASC'),
                      getData('clear')
                  "
                >
                  <div class="flex items-center justify-center">
                    <span class="px-2"> {{ __('card_count') }} </span>
                    <ArrowsUpDownIcon class="w-4 h-4" />
                  </div>
                </th>

                <th
                  scope="col"
                  class="px-2 py-3 cursor-pointer duration-300 hover:text-gray-500 hover:scale-[105%]"
                  @click="
                    (params.order_by = 'game_count'),
                      (params.dir = params.dir == 'ASC' ? 'DESC' : 'ASC'),
                      getData('clear')
                  "
                >
                  <div class="flex items-center justify-center">
                    <span class="px-2"> {{ __('game_count') }} </span>
                    <ArrowsUpDownIcon class="w-4 h-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  class="px-2 py-3 cursor-pointer duration-300 hover:text-gray-500 hover:scale-[105%]"
                  @click="
                    (params.order_by = 'profit'),
                      (params.dir = params.dir == 'ASC' ? 'DESC' : 'ASC'),
                      getData('clear')
                  "
                >
                  <div class="flex items-center justify-center">
                    <span class="px-2"> {{ __('profit') }} </span>
                    <ArrowsUpDownIcon class="w-4 h-4" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class=" ">
              <tr
                v-if="loading"
                v-for="i in 3"
                class="animate-pulse bg-white text-center border-b hover:bg-gray-50"
              >
                <td class="w-4 p-4">
                  <div class="flex items-center">
                    <input
                      id="checkbox-table-search-1"
                      type="checkbox"
                      class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                </td>
                <td class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
                  <div class="w-10 h-10 rounded-full" />
                  <div class="px-3">
                    <div class="text-base bg-gray-200 px-5 py-2 rounded-lg"></div>
                    <div class="font-normal text-gray-500"></div>
                  </div>
                </td>
                <td class="px-2 py-4">
                  <div class="bg-gray-200 px-5 py-2 rounded-lg"></div>
                </td>
                <td class="px-2 py-4">
                  <div class="bg-gray-200 px-5 py-2 rounded-lg"></div>
                </td>
                <td class="px-2 py-4">
                  <div class="bg-gray-200 px-5 py-2 rounded-lg"></div>
                </td>
                <td class="px-2 py-4">
                  <div
                    class="justify-center bg-gray-200 px-5 py-3 rounded-lg items-center text-center rounded-md"
                  ></div>
                </td>
                <td class="px-2 py-4">
                  <div class="bg-gray-200 px-5 py-2 rounded-lg"></div>
                </td>
                <td class="px-2 py-4">
                  <!-- Actions Group -->
                  <div class="bg-gray-200 px-5 py-4 rounded-lg rounded-md" role="group"></div>
                </td>
              </tr>
              <tr v-for="(d, idx) in data" class="bg-white text-center border-b hover:bg-gray-50">
                <td class="w-4 p-4" @click="d.selected = !d.selected">
                  <div class="flex items-center">
                    <input
                      id="checkbox-table-search-1"
                      type="checkbox"
                      v-model="d.selected"
                      class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                </td>
                <td class=" ">{{ d.id }}</td>

                <td class="px-2 py-4">
                  {{ toShamsi(d.date) }}
                </td>
                <td class="px-2 py-4">
                  {{ `${__(d.type ?? '-')}` }}
                </td>

                <td class="px-2 py-4">
                  <div>{{ asPrice(d.cardCount) }}</div>
                </td>
                <td class="px-2 py-4">
                  <div>{{ asPrice(d.gameCount) }}</div>
                </td>
                <td class="px-2 py-4">
                  <div>{{ asPrice(d.profit) }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!--        charge modal-->
        <div
          data-te-modal-init
          class="fixed start-3 end-3 top-[20%] lg:w-[50%] lg:mx-auto rounded-lg z-[1055] hidden overflow-y-auto outline-none"
          :id="`chargeModal`"
          tabindex="-1"
          :aria-labelledby="`chargeModalLabel`"
          aria-hidden="true"
        >
          <div
            data-te-modal-dialog-ref
            class="pointer-events-none relative w-auto translate-y-[-50px] opacity-0 transition-all duration-300 ease-in-out min-[0px]:m-0 min-[0px]:h-full min-[0px]:max-w-none"
          >
            <div
              class="pointer-events-auto relative flex w-full flex-col rounded-md bg-white bg-clip-padding text-current shadow-lg outline-none dark:bg-neutral-600 min-[0px]:h-full min-[0px]:rounded-none min-[0px]:border-0"
            >
              <div
                class="flex items-center justify-between rounded-t-md border-b-2 border-neutral-100 border-opacity-100 p-4 dark:border-opacity-50 min-[0px]:rounded-none"
              >
                <!-- Modal title -->
                <h5
                  class="text-xl font-medium leading-normal text-neutral-800 dark:text-neutral-200"
                  :id="`chargeModalLabel`"
                >
                  <div class="flex items-center">
                    <ArrowsUpDownIcon class="h-7 w-7 mx-3" />
                    {{ `${__('charge')} / ${__('withdraw')}` }}
                  </div>
                </h5>
                <!-- Close button -->
                <button
                  @click="chargeModal.hide()"
                  type="button"
                  class="box-content rounded-none border-none hover:no-underline hover:opacity-75 focus:opacity-100 focus:shadow-none focus:outline-none"
                  data-te-modal-dismiss
                  aria-label="Close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="h-6 w-6"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="flex flex-col items-center justify-center">
                <div>{{ `${__('room')} (${params.id}) ${params.username}` }}</div>
                <div>{{ `${__('balance')}: ${asPrice(params.balance)} ${__('currency')}` }}</div>
              </div>

              <!-- Modal body -->
              <div class="flex flex-col mx-4 items-stretch p-2 pb-0 min-[0px]:overflow-y-auto">
                <div class="flex my-2" role="group">
                  <div
                    type="button"
                    @click="
                      (params.cmnd = 'withdraw'),
                        (params.description = __('wallet_withdraw_*_from_*', {
                          item1: `${asPrice(`${params.amount}`)} ${__('currency')}`,
                          item2: `${__('room')} (${params.id})`,
                          item3: `${__('settlement')}`,
                        }))
                    "
                    class="flex border-2 flex-1 p-2 py-3 text-center text-xs font-medium uppercase leading-normal transition duration-150 ease-in-out hover:border-primary-accent-200 focus:border-primary-accent-200 focus:bg-secondary-50/50 focus:outline-none focus:ring-0 active:border-primary-accent-200 motion-reduce:transition-none dark:border-primary-400 dark:text-primary-300 dark:hover:bg-blue-950 dark:focus:bg-blue-950"
                    :class="`  cursor-pointer ${'rounded-s-lg'} border-dark-500 ${'withdraw' === params.cmnd ? `text-white bg-primary-500` : `text-gray-500 bg-white`}`"
                    data-twe-ripple-init
                    data-twe-ripple-color="light"
                  >
                    <div class="mx-auto">{{ __('withdraw') }}</div>
                  </div>
                  <div
                    type="button"
                    @click="
                      (params.cmnd = 'charge'),
                        (params.description = __('wallet_charge_*_*_for_*', {
                          item1: `${asPrice(`${params.amount}`)} ${__('currency')}`,
                          item2: `${__('room')} (${params.id})`,
                          item3: `${__('cardtocard')}`,
                        }))
                    "
                    class="flex border-2 flex-1 p-2 py-3 text-center text-xs font-medium uppercase leading-normal transition duration-150 ease-in-out hover:border-primary-accent-200 focus:border-primary-accent-200 focus:bg-secondary-50/50 focus:outline-none focus:ring-0 active:border-primary-accent-200 motion-reduce:transition-none dark:border-primary-400 dark:text-primary-300 dark:hover:bg-blue-950 dark:focus:bg-blue-950"
                    :class="`  cursor-pointer ${'rounded-e-lg'} border-dark-500 ${'charge' === params.cmnd ? `text-white bg-primary-500` : `text-gray-500 bg-white`}`"
                    data-twe-ripple-init
                    data-twe-ripple-color="light"
                  >
                    <div class="mx-auto">{{ __('charge') }}</div>
                  </div>
                </div>

                <div class="my-2">
                  <TextInput
                    id="amount"
                    type="number"
                    :placeholder="__('amount')"
                    classes="   "
                    v-model="params.amount"
                    autocomplete="amount"
                    :error="errors.amount"
                  >
                    <template v-slot:prepend>
                      <div class="m-2 px-0">
                        <ArrowsUpDownIcon class="h-5 w-5" />
                      </div>
                    </template>
                  </TextInput>
                </div>

                <div class="my-2">
                  <TextInput
                    id="description"
                    type="text"
                    :placeholder="__('description')"
                    classes="   "
                    v-model="params.description"
                    autocomplete="description"
                    :error="errors.description"
                  >
                    <template v-slot:prepend>
                      <div class="m-2 px-0">
                        <ChatBubbleLeftEllipsisIcon class="h-5 w-5" />
                      </div>
                    </template>
                  </TextInput>
                </div>
              </div>

              <!-- Modal footer -->
              <div
                class="mt-auto flex flex-shrink-0 flex-wrap items-center justify-end rounded-b-md border-t-2 border-neutral-100 border-opacity-100 p-4 dark:border-opacity-50 min-[0px]:rounded-none"
              >
                <div class="flex my-1 w-full" role="group">
                  <div
                    class="cursor-pointer flex justify-center items-center hover:bg-success-600 p-3 bg-success text-white grow rounded-s"
                    :title="__('accept')"
                    @click="edit(params)"
                  >
                    <CheckIcon class="w-4 h-4 mx-1 text-white text-white" />
                    <div>{{ __('accept') }}</div>
                  </div>
                  <div
                    class="cursor-pointer flex justify-center items-center bg-danger hover:bg-danger-600 p-3 text-white grow rounded-e"
                    :title="__('cancel')"
                    @click="chargeModal.hide()"
                  >
                    <XMarkIcon class="w-4 h-4 mx-1 text-white text-white" />
                    <div>{{ __('cancel') }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Panel>
</template>

<script>
import Panel from '~/layouts/Panel.vue'
import { Head, Link, router, useForm } from '@inertiajs/vue3'
import Pagination from '~/components/Pagination.vue'
import {
  Bars2Icon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  HomeIcon,
  XMarkIcon,
  ArrowsUpDownIcon,
  ChatBubbleLeftEllipsisIcon,
} from '@heroicons/vue/24/outline'
import Image from '~/components/Image.vue'
import Tooltip from '~/components/Tooltip.vue'

import {
  __,
  asPrice,
  toShamsi,
  cropText,
  showToast,
  showDialog,
  initTableDropdowns,
  getUrlParams,
  log,
  setUrlParams,
  isLoading,
  getError,
  getErrors,
  getSocketUrl,
} from '~/js/mixins.js'
import { route } from '@izzyjs/route/client'
import { DateTime } from 'luxon'
import TextInput from '~/components/TextInput.vue'
import { PhotoIcon } from '@heroicons/vue/24/outline/index.js'
import { CheckIcon } from '@heroicons/vue/24/solid/index.js'
import LoadingIcon from '~/components/LoadingIcon.vue'
import { io } from 'socket.io-client'

export default {
  data() {
    return {
      params: {
        page: 1,
        payed_at: null,
        search: null,
        paginate: this.$page.props.pageItems[0],
        type: null,
        order_by: null,
        dir: 'DESC',
        user_id: null,
      },
      data: [],
      urlParams: getUrlParams(),
      pagination: {},
      toggleSelect: false,
      loading: false,
      error: null,
      errors: {},
      total: 0,
      admin: this.$page.props.auth.user,
    }
  },
  components: {
    LoadingIcon,
    CheckIcon,
    PhotoIcon,
    TextInput,
    Head,
    Link,
    HomeIcon,
    ChevronDownIcon,
    Panel,
    Bars2Icon,
    Image,
    MagnifyingGlassIcon,
    XMarkIcon,
    Pagination,
    ArrowsUpDownIcon,
    Tooltip,
    ChatBubbleLeftEllipsisIcon,
  },
  async mounted() {
    const { Modal } = await import('tw-elements')
    this.tableWrapper = document.querySelector('table').parentElement

    this.params.type = this.urlParams.type
    this.params.payed_at = this.urlParams.payed_at ? Number.parseInt(this.urlParams.payed_at) : null
    // setUrlParams( {})
    const modalEl = document.getElementById('chargeModal')
    this.chargeModal = new Modal(modalEl)
    this.getData()

    // console.log(this.urlParams)
    // this.showDialog('danger', 'message',()=>{});
    // this.showDialog('danger', 'message',()=>{});
    // this.isLoading(false);
  },
  watch: {},
  methods: {
    showDialog,
    log,
    route,
    __,
    toShamsi,
    asPrice,
    cropText,
    showToast,
    isLoading,
    getError,
    getErrors,

    getData() {
      this.loading = true
      this.data = []
      window.axios
        .get(
          route(`admin.panel.log.search`),
          {
            params: this.params,
          },
          {}
        )
        .then((response) => {
          if (response.data) {
            this.data = response.data.data
            this.total = response.data.meta.total
          }
          this.data.forEach((el) => {
            el.selected = false
            el.accesses = el.accesses ? el.accesses.split(',') : []
          })
          delete response.data.data
          this.pagination = response.data

          this.$nextTick(() => {
            initTableDropdowns()
            this.setTableHeight()
          })

          // const d = this.data[0]
          // this.params.id = d.id
          // this.params.idx = 0
          // this.params.cmnd = 'withdraw'
          // this.params.amount = d.balance
          // this.params.username = d.username
          // this.params.balance = d.balance
          // this.params.description = __('wallet_withdraw_*_from_*', {
          //   item1: `${asPrice(`${this.params.amount}`)} ${__('currency')}`,
          //   item2: `${__('user')} (${this.params.id})`,
          //   item3: `${__('settlement')}`,
          // })
          // this.chargeModal.show()
        })

        .catch((error) => {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data)
            console.log(error.response.status)
            console.log(error.response.headers)
            this.error = error.response.data
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request)
            this.error = error.request
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message)
            this.error = error.message
          }
          console.log(error.config)

          showToast('danger', error)
        })
        .finally(() => {
          // always executed
          this.loading = false
        })
    },
    setTableHeight() {
      let a = window.innerHeight - this.tableWrapper.offsetTop
      // this.tableWrapper.classList.add(`h-[60vh]`);
      this.tableWrapper.style.height = `${a}px`
      // this.tableWrapper.firstChild.classList.add(`overflow-y-scroll`);
    },
    toggleAll() {
      this.toggleSelect = !this.toggleSelect
      this.data.forEach((e) => {
        e.selected = this.toggleSelect
      })
    },
    edit(params) {
      this.isLoading(true)
      window.axios
        .patch(route('admin.panel.room.update'), params, {})
        .then((response) => {
          if (response.data && response.data.message) {
            this.showToast('success', response.data.message)
          }

          if (response.data.is_active != null) {
            this.data[params.idx].isActive = response.data.is_active
          }

          if (response.data.payed_at) {
            this.data[params.idx].payedAt = response.data.payed_at
          }
          if (response.data.balance != null) {
            this.data[params.idx].balance = response.data.balance
            this.chargeModal.hide()
            this.params.id = null
            this.params.username = null
            this.params.amount = 0
            this.params.cmnd = null
            this.params.description = null
            this.params.idx = null
          }

          if (response.data.removed) {
            this.getData()
          }
        })

        .catch((error) => {
          this.error = this.getError(error)
          this.errors = this.getErrors(error)
          if (error.response && error.response.data) {
            if (error.response.data.charge) {
              this.data[params.idx].charge = error.response.data.charge
            }
            if (error.response.data.view_fee) {
              this.data[params.idx].view_fee = error.response.data.view_fee
            }
            if (error.response.data.meta) {
              this.data[params.idx].meta = error.response.data.meta
            }
          }
          this.showToast('danger', this.error)
        })
        .finally(() => {
          // always executed
          this.isLoading(false)
        })
    },
    paginationChanged(data) {
      this.params.page = data.page
      this.getData()
    },
    bulkAction(cmnd) {},
  },
}
</script>
