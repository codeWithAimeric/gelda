'use client'

import Link from 'next/link'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader } from '@/components/ui/shared/loader'

import { useUserTickets } from '@/hooks/mod/tickets/use-user-tickets'
import { COLOR_BY_PRIORITY_ID } from '@/lib/constants'

const ClosedTickets = () => {
  const { tickets, loading } = useUserTickets({ status: 'closed', limit: 3 })

  const hasTickets = Array.isArray(tickets) && tickets.length > 0

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-sm font-medium'>Closed Tickets</CardTitle>
        {hasTickets ? (
          <Link className='text-sm text-gray-500 dark:text-gray-400' href='#'>
            View all
          </Link>
        ) : null}
      </CardHeader>
      {loading ? (
        <div className='flex w-full justify-center items-center'>
          <Loader />
        </div>
      ) : (
        <CardContent className='h-[100px] overflow-auto'>
          <div className='flex flex-col gap-2'>
            {hasTickets ? (
              <>
                {tickets.map((ticket) => (
                  <div className='flex items-center justify-between' key={ticket.id}>
                    <div className='flex items-center gap-2'>
                      <div className='inline-flex items-center gap-2 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600 dark:bg-red-900 dark:text-red-400'>
                        {ticket.status?.name}
                      </div>
                      <Link className='font-medium' href='#'>
                        #{ticket.reference} {ticket.title}
                      </Link>
                    </div>
                    <div
                      className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium ${COLOR_BY_PRIORITY_ID[ticket.priorityId]}`}
                    >
                      {ticket.priority?.name}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className='flex justify-center mt-4 items-center'>
                <span className='text-sm w-80 text-center'>
                  Oops! No recent closed tickets found. Looks like it&apos;s time to create a new
                  one !
                </span>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export { ClosedTickets }
