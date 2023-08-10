import React, { Component } from 'react';
// import Particles from 'react-particles-js';
import ParticlesBg from 'particles-bg'
//import Clarifai from 'clarifai';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import './App.css';




    const returnClarifaiRequestOptions =(imageUrl)=>{
    // Your PAT (Personal Access Token) can be found in the portal under Authentification
    const PAT = '554e5f9c9f8c47f783eae688b6c14d1c';
    // Specify the correct user_id/app_id pairings
    // Since you're making inferences outside your app's scope
    const USER_ID = 'momo1062';       
    const APP_ID = 'faceai';
    // Change these to whatever model and image URL you want to use
    const MODEL_ID = 'face-detection';
  
    const IMAGE_URL = imageUrl;

    const  raw = JSON.stringify({
      "user_app_id": {
          "user_id": USER_ID,
          "app_id": APP_ID
      },
      "inputs": [
          {
              "data": {
                  "image": {
                      "url": IMAGE_URL
                  }
              }
          }
      ]
  });

 const requestOptions= {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT
    },
    body: raw
};
return requestOptions;

    }


 


    
class  App extends Component {
  constructor(){
    super();
    this.state={
      input:'',
      imageUrl:'',
      box:[],
      route:'signin',
      isSignedIn:false,
      user:{
        id:'',
        name:'',
        email:'',
        joined:'',
      }
    }
  }
  // componentDidMount(){
  //   fetch('http://localhost:3000/')
  //   .then(response=> response.json())
  //   .then(data=>console.log(data));
  // }
  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      joined: data.joined
    }})
  }
onInputChange =(event)=>{
  console.log(event.target.value);
  this.setState({
    input:event.target.value,
    box:[]
  });
 

}


calculateFaceLocations = (result) => {
  const image = document.getElementById('inputimage');
  

  const width = Number(image.width);
  const height = Number(image.height);
  //console.log('image height',image.height);
  //console.log('image width',image.width);

   
    //const clarifaiFace = result.outputs[0].data.regions[0].region_info.bounding_box;
    //console.log(result);
    const { left_col, top_row, right_col, bottom_row } = result;
    
    const bounding= {
      leftCol: left_col * width,
      topRow: top_row * height,
      rightCol: width - (right_col * width),
      bottomRow: height - (bottom_row * height)
    };
    this.displayFaceBox(bounding);
  

  
};

displayFaceBox = (newbox) => {
  this.setState((prevState) => ({
    box: [...prevState.box, newbox],
  }));
};


onButtonSubmit=()=>{
  this.setState({imageUrl:this.state.input});






 // app.models.predict('face-detection', this.state.input)
  fetch("https://api.clarifai.com/v2/models/" +  'face-detection' + "/outputs", returnClarifaiRequestOptions(this.state.input))
  .then(response => {
    // if (response) {
    //   fetch('http://localhost:3000/image', {
    //     method: 'put',
    //     headers: {'Content-Type': 'application/json'},
    //     body: JSON.stringify({
    //     id: this.state.user.id
    //     })
    //   })
    //   .then(res=>{
    //     console.log(res.status);
        
    //   })
    //   // .then(response=>response.json())
    //   // .then(count=>{
    //   //   this.setState({users:{
    //   //     entries:count
    //   //   }})
    //   // })
    // }
    return response.json(); 
  })
  //.then(result=>console.log(result));
  .then(result=> {
    const boundingBoxes=result.outputs[0].data.regions.map(region =>region.region_info.bounding_box);
    boundingBoxes.forEach(boundingBox=>{
      this.calculateFaceLocations(boundingBox);
    })
  })
  .catch(err=> window.prompt('INVALID IMAGE OR TOO BLURRY!'))
  //.then(result=>console.log('happy'));
  //.then(result => (console.log(result), console.log(result.outputs[0].data.regions[0].region_info.bounding_box)));
  
  //.then(result => console.log(result))

  //.then(bound=> console.log(this.calculateFaceLocations(bound)));
  
  //.then(result=>this.displayFaceBox(this.calculateFaceLocations(result)))
  //.catch(error => console.log('error', error));
  



}
onRouteChange = (route) => {
  if (route === 'signout') {
    this.setState({isSignedIn: false})
  } else if (route === 'home') {
    this.setState({isSignedIn: true})
  }
  this.setState({route: route});
}
render() {
  const { isSignedIn, imageUrl, route, box } = this.state;
  return (
    <div className="App">
      <ParticlesBg type="fountain" bg={true} />
      <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
      { route === 'home'
        ? <div>
            <Logo />
            <Rank
              name={this.state.user.name}
              entries={this.state.user.entries}
            />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
        : (
           route === 'signin'
           ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
           : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          )
      }
    </div>
  );
}
}

export default App;
