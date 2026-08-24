import Card from './Card'
import data from './assets/data.json'
function App() {
  console.log(data)
  return (
  <>
   {
    data.map((data,index)=>{
      <Card key={index} id={data.id} title={data.title} body={data.body} userId={data.userId}/>
    })
   }
   </>
  )
}

export default App

