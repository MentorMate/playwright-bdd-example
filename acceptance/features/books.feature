Feature: Books library
  Users should be able to login and browse books

  Background: I am logged in as administrator
    Given I sign in as admin
     Then I see the home page

  Scenario: Preview a book
    Given I go to 'Books'
     Then I see the 'Books' title
     Then I wait for the table 'My Library' to load
     When I type 'habits' in the 'search a book' field
      And I click the 'Search' button
     Then I see a book called 'Atomic Habits'
     When I click the 'Preview Atomic Habits' button
     Then I see the 'Preview: Atomic Habits' title
      And I see book details
          | label       | value         |
          | id          | 10            |
          | name        | Atomic Habits |
          | description | No matter your goals, Atomic Habits offers a proven framework for improving--every day |
