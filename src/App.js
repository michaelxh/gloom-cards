import React, { Component } from 'react'
import './App.css'
import update from 'immutability-helper'
import Card from './components/Card'
import { Header } from './components/Header'
import { classes } from './data'

class App extends Component {
  state = {
    character: '',
    cards: [],
    editing: false,
  }

  save(character, data) {
    if (!character) character = this.state.character
    if (!data) data = this.state.cards
    window.localStorage.setItem(character, JSON.stringify(data))
  }

  init(character) {
    if (!character) return false
    const {total, starting, order} = classes[character]
    //"starting = total - 16" instead of putting it in data?
    const data = [...Array(total)].map( (e, index) =>
      ({id: order ? order[index] : index+1,
        visible: starting > index,
        filter: '' })
    )
    this.save(character, data)
    this.setState({ cards: data })
  }

  load(character) {
    const data = window.localStorage.getItem(character)
    if (data) {
      this.setState({ cards: JSON.parse(data) })
    } else {
      this.init(character)
    }
  }

  componentDidMount() {
    const character = window.localStorage.getItem('character') || null;
    this.setState({ character })
    this.load(character)
  }

  moveCard(dragIndex, hoverIndex) {
    const { cards } = this.state
		const dragCard = cards[dragIndex]

		this.setState(
			update(this.state, {
				cards: {
					$splice: [[dragIndex, 1], [hoverIndex, 0, dragCard]],
				},
			}),
		() => {
      this.save(this.state.character, this.state.cards)
    })
  }

  switchCharacter(character) {
    this.setState({character: character});
    this.load(character)
    window.localStorage.setItem('character', character)
  }

  toggleCard(index) {
    this.setState(
			update(this.state, {
				cards: {
					[index]: { visible: { $apply: (e) => !e } }
				},
			})
    , this.save)
  }

  toggleEditing() {
    this.setState({editing: !this.state.editing})
  }

  setFilter(index, filter) {
    this.setState(
      update(this.state, {
        cards: {
          [index]: { filter: { $apply: (_e) => this.state.cards[index].filter !== filter ? filter : ''} }
        },
      })
      , this.save)
  }

  render() {
    const { character, cards } = this.state
    return (
      <div className="App">
        <Header
          switchCharacter={(value) => this.switchCharacter(value)}
          toggleEditing={() => this.toggleEditing()}
          editing={this.state.editing}
          cards={cards}
          classes={classes}
          character={character}
        />

        <div className="card-container">

          {!this.state.character &&
            <strong style={{fontSize: 44, color: '#ddd'}}>Pick a character</strong>
          }

          {this.state.character && this.state.cards.length === 0 &&
            <span>You don't have any cards selected</span>
          }

          {this.state.cards.map( (item, i) => (
            <Card
              key={item.id}
              character={this.state.character}
              id={item.id}
              index={i}
              moveCard={this.moveCard.bind(this)}
              showToggle={this.state.editing}
              visible={item.visible}
              toggleCard={this.toggleCard.bind(this)}
              filter={item.filter}
              setFilter={this.setFilter.bind(this)}
            />
          ))}
        </div>
        <div className="footer">
          Got a question, bug, or suggestion? &nbsp;
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/ksokhan/gloom-cards/issues">Submit a Github issue</a>.
        </div>
      </div>
    );
  }
}

export default App;
