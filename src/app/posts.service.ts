import { catchError, map, tap } from 'rxjs/operators';
import { Post } from './post.model';
import {
  HttpClient,
  HttpEventType,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  error = new Subject<string>();

  constructor(private http: HttpClient) {}

  createAndStorePost(title: string, content: string) {
    const postData: Post = {
      title,
      content,
    };
    this.http
      .post<{ name: string }>(
        'https://angular-testing-d0332-default-rtdb.firebaseio.com/post.json',
        postData,
        {
          observe: 'response',
        }
      )
      .subscribe(
        (responseData) => {
          console.log('responseData: ', responseData);
        },
        (error) => {
          this.error.next(error.message);
        }
      );
  }

  fetchPosts() {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('print', 'pretty');
    searchParams = searchParams.append('custom', 'key');
    return this.http
      .get<{ [key: string]: Post }>(
        'https://angular-testing-d0332-default-rtdb.firebaseio.com/post.json',
        {
          headers: new HttpHeaders({
            'Custom-Header': 'Hello',
          }),
          params: searchParams,
          responseType: 'json',
        }
      )
      .pipe(
        map((responseData) => {
          const postsArray: Post[] = [];

          for (const key in responseData) {
            if (responseData.hasOwnProperty(key)) {
              postsArray.push({ ...responseData[key], id: key });
            }
          }
          return postsArray;
        }),
        catchError((errorRes) => {
          return throwError(errorRes);
        })
      );
  }
  deletePosts() {
    return this.http
      .delete(
        'https://angular-testing-d0332-default-rtdb.firebaseio.com/post.json',
        {
          observe: 'events',
          responseType: 'text',
        }
      )
      .pipe(
        tap((event) => {
          console.log('event: ', event);
          if (event.type === HttpEventType.Response) {
            console.log(event.body);
          }
        })
      );
  }
}
