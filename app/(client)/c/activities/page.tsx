'use client'

import { useState, useEffect } from 'react'
import { ActivityIcon, SearchIcon, FilterIcon } from 'lucide-react'

import { Card, CardHeader, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/shared/range-datepicker'

import { readableTimestamp, formatToReadable } from '@/lib/utils'
import { ACTIVITIES_TYPES } from '@/lib/constants'

import { useActivities } from '@/hooks/use-activities'
import { ActivityType } from '@/lib/definitions'

const Page = () => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)
  const [filters, setFilters] = useState({
    type: '',
    timestamp: ''
  })

  const { list, loading, activities } = useActivities()

  const filteredLogs = activities.filter((log) => {
    const { type, timestamp } = filters

    return (
      log.type.toLowerCase().includes(searchTerm.toLowerCase()) &&
      log.type.toLowerCase().includes(type.toLowerCase()) &&
      log.timestamp.toLowerCase().includes(timestamp.toLowerCase())
    )
  })
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)

  const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber)

  const handleResetFilters = () => setFilters({ type: '', timestamp: '' })

  useEffect(() => {
    list()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='flex flex-1 flex-col gap-8 p-6 md:gap-12 md:p-12'>
      <section className='w-[800px] mx-auto pb-12 md:pb-16 lg:pb-20 px-4 md:px-6 gap-6 flex flex-col'>
        <div className='grid gap-8'>
          <div className='gap-2 flex items-center'>
            <ActivityIcon size={20} />
            <h1 className='text-3xl font-bold'>Activities</h1>
          </div>
        </div>

        <Card className='w-full'>
          <CardHeader>
            <CardDescription>View and filter activity actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='w-full flex flex-col gap-6'>
              <div className='flex gap-2'>
                <div className='relative w-full'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <SearchIcon className='h-5 w-5 text-muted-foreground' />
                  </div>
                  <Input
                    type='text'
                    placeholder='Search activity logs...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10 pr-4 py-2 rounded-md w-full border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary'
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='icon'>
                      <FilterIcon className='h-4 w-4' />
                      <span className='sr-only'>Filters</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>Filters</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className='grid gap-6 p-2'>
                      <div className='grid gap-4'>
                        <Label htmlFor='type-filter'>Type</Label>
                        <Select
                          value={filters.type}
                          onValueChange={(type) => setFilters({ ...filters, type })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Filter by type' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {ACTIVITIES_TYPES.map((type: string) => (
                                <SelectItem key={type} value={type}>
                                  {formatToReadable(type)}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='grid gap-4'>
                        <Label htmlFor='timestamp-filter'>Timestamp</Label>
                        <DatePickerWithRange
                          onSelect={() => {
                            console.log('changed')
                          }}
                        />
                        <Input
                          id='timestamp-filter'
                          type='text'
                          placeholder='Filter by timestamp'
                          value={filters.timestamp}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              timestamp: e.target.value
                            }))
                          }
                        />
                      </div>

                      <Button variant='outline' onClick={handleResetFilters}>
                        Reset filters
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className='overflow-x-auto'>
                <ActivitiesTable loading={loading} currentItems={currentItems} />
              </div>
              <div className='flex items-center justify-between mt-6'>
                <ActivitiesTablePagination
                  indexOfFirstItem={indexOfFirstItem}
                  indexOfLastItem={indexOfLastItem}
                  filteredLogs={filteredLogs}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handlePageChange={handlePageChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

const ActivitiesTable = ({
  loading,
  currentItems
}: {
  loading: boolean
  currentItems: ActivityType[]
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Activity Type</TableHead>
          <TableHead>Timestamp</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell>
              <div className='h-6 w-full rounded-md bg-muted' />
            </TableCell>
            <TableCell>
              <div className='h-6 w-full rounded-md bg-muted' />
            </TableCell>
            <TableCell>
              <div className='h-6 w-full rounded-md bg-muted' />
            </TableCell>
          </TableRow>
        ) : (
          <>
            {currentItems.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{formatToReadable(log.type)}</TableCell>
                <TableCell>{readableTimestamp(log.timestamp)}</TableCell>
                <TableCell>{log.description}</TableCell>
              </TableRow>
            ))}
          </>
        )}
      </TableBody>
    </Table>
  )
}

const ActivitiesTablePagination = ({
  indexOfFirstItem,
  indexOfLastItem,
  filteredLogs,
  currentPage,
  totalPages,
  handlePageChange
}: {
  indexOfFirstItem: number
  indexOfLastItem: number
  filteredLogs: ActivityType[]
  currentPage: number
  totalPages: number
  handlePageChange: (page: number) => void
}) => {
  return (
    <>
      <div className='text-sm text-muted-foreground'>
        Showing {indexOfFirstItem + 1} to {indexOfLastItem} of {filteredLogs.length} logs
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            {currentPage !== 1 ? (
              <PaginationPrevious href='#' onClick={() => handlePageChange(currentPage - 1)} />
            ) : null}
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href='#'
                isActive={page === currentPage}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            {currentPage !== totalPages ? (
              <PaginationNext href='#' onClick={() => handlePageChange(currentPage + 1)} />
            ) : null}
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  )
}

export default Page
