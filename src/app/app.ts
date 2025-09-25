import { HttpClient } from '@angular/common/http'
import { Component, inject } from '@angular/core'
import { MUISelect, SelectHandler } from '@async-select/my-ui-lib'
import { TuiRoot } from '@taiga-ui/core'
import { map } from 'rxjs'

export type User = {
  id: 1
  firstName: string
  lastName: string
  maidenName: string
  age: number
  gender: string
  email: string
  phone: string
}
@Component({
  imports: [TuiRoot, MUISelect],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  private readonly httpClient = inject(HttpClient)

  users = this.httpClient
    .get<{ users: User[] }>('https://dummyjson.com/users')
    .pipe(map(({ users }) => users))

  usersPaginated: SelectHandler<User> = ({ pageNumber, pageCapacity }) => {
    return this.httpClient
      .get<{
        users: User[]
        limit: number
        skip: number
        total: number
      }>(
        `https://dummyjson.com/users?limit=${pageCapacity}&skip=${pageNumber * pageCapacity}`,
      )
      .pipe(
        map(({ users, limit, skip, total }) => {
          return {
            options: users,
            metadata: {
              pageNumber: skip / limit,
              pageCapacity: limit,
              total: total,
            },
          }
        }),
      )
  }

  stringifyUser = (user: User) => user.firstName
}
