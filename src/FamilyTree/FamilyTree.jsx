// import module styles
import './FamilyTree.module.css'

// React imports
import {
  useState,
  useEffect,
  useRef,
  React
} from 'react'

// D3 imports
import {
  csv,
  scaleLinear,
  select,
  axisLeft,
} from 'd3'

// define constants
const width = window.innerWidth < 768 ? '100%' : 550
const margin = { top: 5, right: 10, bottom: 5, left: 10 }
const innerWidth = width - margin.left - margin.right
const padding = 1

const dataUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSkJC69ibvZ11GazByREhQ9O7ULwgZs6yeMW01VjTFv8FmBC8iVNeyA-JoQl2uxQSU6wuZ5Q-vyQcD-/pub?gid=0&single=true&output=csv'

function YogurtItem({ props }) {
  // function to convert each row in the data to a component
  // output should be a div
  return  (
    <div class="yogurtItem">
      <img src="../../public/yogurtContainer.png" alt="A container of yogurt" />
      <p class="yogurtName">{yogurtName}</p>
    </div>
    )
}

// create function
function FamilyTree({ dataFile, color="#9a00f9" }) {
  const [ data, setData ] = useState(null)
  const treeRef = useRef()

  useEffect(() => {
    csv(dataUrl).then(function(data) {
      data = data.valueOf()
      setData([...data])
      console.log(data)
    })
  }, [])

	return (
    <p>fff</p>
    )
}

export default FamilyTree;