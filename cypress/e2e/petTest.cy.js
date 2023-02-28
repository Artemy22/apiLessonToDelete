///<reference types="cypress"/>

import { faker } from "@faker-js/faker"
import pet from '../fixtures/pet.json'

pet.id = parseInt(faker.random.numeric(5));
pet.name = faker.animal.crocodilia.name;
pet.category.id = parseInt(faker.random.numeric(3));
pet.category.name = faker.animal.type();

let petId;

describe('Pet suite', () => {
  it('pet creation', () => {
    cy.request('POST', '/pet', pet)
      .then(response => {
        cy.log(`Request body: ${response.allRequestResponses[0]["Request Body"]}`);
        expect(response.status).to.be.equal(200)
        expect(response.statusText).to.be.equal('OK')
        expect(response.isOkStatusCode).to.be.true
        expect(response.body.id).to.be.equal(pet.id)
        petId = response.body.id
        console.log(petId)
        expect(response.body.name).to.be.equal(pet.name)
        expect(response.body.category.id).to.be.equal(pet.category.id)
        expect(response.body.category.name).to.be.equal(pet.category.name)
      })
  })

  it('pet get by ID', () => {
    cy.request('GET', `/pet/${petId}`)
      .then(response => {
        expect(response.body.id).to.be.equal(petId)
      })
  })

  it('Update a pet image', () => {
    
    cy.fixture('pet.png', 'binary').then( image => {
      const blob = Cypress.Blob.binaryStringToBlob(image);
      const formData = new FormData();
      formData.append('file', blob, 'pet.png');
      formData.append('additionalMetadata', 'additionalMetadata');
      formData.append('type', 'image/png');
    
        cy.request({
          method: 'POST', 
          url: `/pet/${petId}/uploadImage`,
          body: formData,
          headers: {
            'content-type': 'multipart/form-data',
            'accept': 'application/json'
          }
        }).then(response => {
          console.log(response.body)
          expect(response.isOkStatusCode)
        })
      })

  })

  it('pet update', () => {
    let pet2 = {
      "id": petId,
      "category": {
        "id": pet.id,
        "name": "string"
      },
      "name": pet.name,
      "photoUrls": [
        "string"
      ],
      "tags": [
        {
          "id": 0,
          "name": "string"
        }
      ],
      "status": "available"
    }
    cy.request('PUT', '/pet', pet2)
      .then(response => {
        expect(response.status).to.be.equal(200)
        expect(response.statusText).to.be.equal('OK')
        expect(response.isOkStatusCode).to.be.true
        expect(response.body.id).to.be.equal(petId)
        expect(response.body.category.id).to.be.equal(pet.id)
        expect(response.body.name).to.be.equal(pet.name)
      })
  })

  it('find pet by status', () => {
    cy.request('GET', 'pet/findByStatus?status=available')
      .then(response => {
        expect(response.status).to.be.equal(200)
        for (let i = 0; i < response.body.length; i++) {
          expect(response.body[i].status).to.be.equal('available')
        }
      })
  })

  it('Updates a pet in the store with form data', () => {
    cy.request({
      method: 'POST',
      url: `/pet/${petId}`,
      form: true,
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: {
        name: 'nameNew',
        status: 'statusNew',
      },
    })
      .then(responce => {
        expect(responce.body.type).to.be.equal("unknown")
      })
  })

  it('Delete pet by ID success ', () => {
    cy.request({
      method: 'DELETE',
      url: `/pet/${petId}`,
      headers: {
        'api_key': '123'
      }
    })
      .then(responce => {
        expect(responce.status).to.be.equal(200)
      })
  })


  it('Delete pet by ID fail', () => {
    cy.request({
      method: 'DELETE',
      failOnStatusCode: false,
      url: `/pet/${petId}`,
      headers: {
        'api_key': '123'
      }
    })
      .then(responce => {
        expect(responce.status).to.be.equal(404)
      })
  })
})
