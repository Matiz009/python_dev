from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

class Book(BaseModel):
    id: int
    title: str
    price: float
    author: str


books : List[Book] = [
    Book(id=1, title="1984", price=10.99, author="George Orwell"),
    Book(id=2, title="To Kill a Mockingbird", price=12.99, author="Harper Lee")
]


@app.get('/')
def read_root():
    return {"message": "Welcome to the Book API!"}


@app.get('/books')
def get_books():
    return books

@app.post('/books')
def create_book(book: Book):
    books.append(book)
    return book

@app.get('/books/{book_id}')
def get_book(book_id: int):
    for book in books:
        if book.id == book_id:
            return book
    return {"error": "Book not found"}

@app.put('/books/{book_id}')
def update_book(book_id: int, updated_book: Book):
    for index, book in enumerate(books):
        if book.id == book_id:
            books[index] = updated_book
            return updated_book
    return {"error": "Book not found"}


@app.delete('/books/{book_id}')
def delete_book(book_id: int):
    for index, book in enumerate(books):
        if book.id == book_id:
            deleted_book = books.pop(index)
            return deleted_book
    return {"error": "Book not found"}
