'use client'

import { CreateTicket } from '@/components/client/create-ticket'
import { Chat } from '@/components/client/chat'
import { RecentTickets } from '@/components/client/recent-tickets'

const Page = () => {
  return (
    <div className='flex min-h-[calc(94vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10'>
      <div className='grid gap-4 lg:grid-cols-3'>
        <CreateTicket />
        <RecentTickets />
        <Chat />
      </div>
    </div>
  )
}

export default Page
