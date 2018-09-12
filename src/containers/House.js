import React, { Component } from 'react';
import { Alert, Button } from 'reactstrap';
import { Container, Row, Col } from 'reactstrap';
import { Jumbotron } from 'reactstrap';
import TweetEmbed from 'react-tweet-embed';
import PlacesAutocomplete, {geocodeByAddress, getLatLng} from 'react-places-autocomplete';
import Districts from '../actions/Districts';
import Campaigns from '../actions/Campaigns';
import States from '../actions/States';
import { Form, FormGroup, Input } from 'reactstrap';

export default class House extends Component {
  constructor(props) {
    super(props)
    const params = new URLSearchParams(props.location.search);
    const districtId = params.get('district');
    const stateId = params.get('state');
    this.state = {
      address: '',
      districtId: districtId,
      district: null,
      demCandidate: null,
      repCandidate: null,
      showDistrictSelector: false,
      stateOptions: null,
      selectedState: 0,
      stateDisabled: true,
      stateId: stateId,
      senateElection: false,
      districtOptions: null,
      selectedDistrict: 0,
      districtDisabled: true 
    }
    this.onFindDistrict = this.onFindDistrict.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.setCampaign = this.setCampaign.bind(this);
  }

  componentDidMount() {
    var stateOptions = [];
    var districtOptions = [];
    var senateElection = false;
    States.search("list",(states) => {
      stateOptions.push(<option value={0}>Select State</option>);
      for (let i=0; i<states.length; i++){
        if (states[i].id == this.state.stateId) {
          if (states[i].senate_election == true) senateElection = true;
          stateOptions.push(<option value={states[i].id} selected>{states[i].name}</option>);
          for (let j=0; j<states[i].districts.length; j++){
            if (states[i].districts[j].id == this.state.districtId){
              districtOptions.push(<option value={states[i].districts[j].id} selected>{states[i].districts[j].name}</option>);
            } else {
              districtOptions.push(<option value={states[i].districts[j].id}>{states[i].districts[j].name}</option>);
            }
          }
        } else {
          stateOptions.push(<option value={states[i].id}>{states[i].name}</option>);
        }
      }
      this.setState({
        stateOptions: stateOptions,
        districtOptions: districtOptions,
        districtDisabled: false,
        stateDisabled: false,
        districtDisabled: false,
        senateElection: senateElection
      });
    });
    if (this.state.districtId){
      Districts.show(this.state.districtId, (district) => {
        Campaigns.index("q[election_office_district_id_eq]="+district.id, (campaigns) => {
          this.setCampaign(district, campaigns);
        });
      });
    }
  }

  handleChange = address => {
    this.setState({ address });
  }

  handleSelect = address => {
    this.setState({address: address});
  }

  handleStateChange(e) {
    this.setState({
      selectedState: e.target.value
    });
    Districts.byState(e.target.value, (districts) => {
      var districtOptions = [];
      districtOptions.push(<option value={99}>Select District</option>);
      for (var i=0; i<districts.length; i++){
        districtOptions.push(<option value={districts[i].id}>{districts[i].name}</option>);
   
      }
      this.setState({
        districtOptions: districtOptions,
        districtDisabled: false});
    });
  }

  onSenate(){
    var url = window.location.protocol + "//" + window.location.hostname + "/" + "senate?state="+this.state.district.state.id;
    window.location.href = url; 
  }
  onShowDistrictSelector(){
    this.setState({showDistrictSelector: true});
  }
  onFindDistrict () {
    Districts.searchFull(this.state.address, (district) => {
      Campaigns.index("q[election_office_district_id_eq]="+district.id, (campaigns) => {
        this.setCampaign(district, campaigns);
      });
    }).catch(error =>
      console.log("This is the error: "+error)
    );
    
    //geocodeByAddress(this.state.address)
    //  .then(results => getLatLng(results[0]))
    //  .then(latLng => console.log('Success', latLng))
    //  .catch(error => console.error('Error', error));
  }
  setCampaign(district, campaigns) {
    var demCandidate = null;
    var repCandidate = null;
    for (var i=0; i<campaigns.length; i++){
      if (campaigns[i].politician.party == 'democrat'){
        demCandidate = campaigns[i];
      } else if (campaigns[i].politician.party == 'republican'){
        repCandidate = campaigns[i];
      }
    }
    this.setState({
      district: district,
      demCandidate: demCandidate,
      repCandidate: repCandidate
    });
  }
  renderTitle(){
    var text = "Find candidates in your district";
    if (this.state.district){
      text = "Candidates for "+this.state.district.state.name+" "+this.state.district.name+" Congressional district";
    }
    return([
        <Row>
          <Col md={{size: 12}} >
              <h2>{text}</h2>
          </Col>
        </Row>
    ]);
  }
  renderAddressBar() {
    return (
      <Alert color="primary">
      <h3>Find your congressional district</h3>
      <Row>
      <Col md={10}>
      <PlacesAutocomplete
        value={this.state.address}
        onChange={this.handleChange}
        onSelect={this.handleSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <input
              {...getInputProps({
                placeholder: 'Enter your home address...',
                className: 'form-control location-search-input',
              })}
            />
            <div className="autocomplete-dropdown-container">
              {loading && <div>Loading...</div>}
              {suggestions.map(suggestion => {
                const className = suggestion.active
                  ? 'suggestion-item--active'
                  : 'suggestion-item';
                // inline style for demonstration purpose
                const style = suggestion.active
                  ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                  : { backgroundColor: '#ffffff', cursor: 'pointer' };
                return (
                  <div
                    {...getSuggestionItemProps(suggestion, {
                      className,
                      style,
                    })}
                  >
                    <span>{suggestion.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PlacesAutocomplete>
      </Col>
      <Col sm={2}>
      <Button onClick={() => {this.onFindDistrict()}}>Find District</Button>
      </Col>
      </Row>
      <Button color="link"  onClick={() => {this.onShowDistrictSelector()}} className="pl-0">I already know my congressional district</Button>
       {this.renderDistrictSelector()}
      </Alert>
    );
  }
  renderDistrictSelector() {
    if (this.state.showDistrictSelector){
    return ([
      <Form inline>
   
      <Input type="select" name="state" disabled={(this.state.stateDisabled)? "disabled" : ""} onChange={this.handleStateChange}>
        {this.state.stateOptions}
      </Input>
      <Input type="select" name="district" disabled={(this.state.districtDisabled)? "disabled" : ""}>
        {this.state.districtOptions}
      </Input>
      <Button>Find Candidates</Button>
      </Form>
    ]);
    }
  }
  renderDemCandidatePosts() {
    if (this.state.demCandidate.politician.posts.length == 1) {
      return ([
        <TweetEmbed id={this.state.demCandidate.politician.posts[0].social_id} />
      ]);
    } else if (this.state.demCandidate.politician.posts.length == 2) {

      return ([
        <TweetEmbed id={this.state.demCandidate.politician.posts[0].social_id} />,
        <TweetEmbed id={this.state.demCandidate.politician.posts[1].social_id} />
      ]);
    } else {
      if (!this.state.demCandidate.politician.twitter) {
        return([
          <p>No twitter account for this candidate</p>
        ]);
      } else {
        return([
          <p>No posts for this candidate</p>
        ]);
      }
    }
  }
  renderDemCandidateName() {
    if (this.state.demCandidate){
      return([
        <h3 className="text-primary">{this.state.demCandidate.politician.first_name} {this.state.demCandidate.politician.last_name} (D)</h3> 
      ]);
    } else {
      return([
        <h3>No Democratic candidate</h3>
      ]);
    }
  }
  renderRepCandidateName() {
    if (this.state.repCandidate){
      return([
        <h3 className="text-primary">{this.state.repCandidate.politician.first_name} {this.state.repCandidate.politician.last_name} (R)</h3>
      ]);
    } else {
      return([
        <h3>No Republican candidate</h3>
      ]);
    }
  }

  renderRepCandidatePosts() {
    if (!this.state.repCandidate){
      return ([]);
    } else if (this.state.repCandidate.politician.posts.length == 1) {
      return ([
        <TweetEmbed id={this.state.repCandidate.politician.posts[0].social_id} />
      ]);

    } else if (this.state.repCandidate.politician.posts.length == 2) {
      return ([
        <TweetEmbed id={this.state.repCandidate.politician.posts[0].social_id} />,
        <TweetEmbed id={this.state.repCandidate.politician.posts[1].social_id} />
      ]);
    } else {
      if (!this.state.repCandidate.politician.twitter) {
        return([
          <p>No twitter account for this candidate</p>
        ]);
      } else {
        return([
          <p>No posts for this candidate</p>
        ]);
      }
    }

  } 
  renderCandidates() {
    if (!this.state.district){
      return ([
        <p></p>
      ]);
    } else {
    return ([
        <div>
        {this.renderTitle()}
        <Row>
          <Col>
            {this.renderDemCandidateName()}
            {this.renderDemCandidatePosts()}
          </Col>
          <Col>
            {this.renderRepCandidateName()}
            {this.renderRepCandidatePosts()}
          </Col>
        </Row>
        </div>
    ]);
    }
  }

  renderSenateLink() {
    return([
      <div className="text-center"><Button color="link"  onClick={() => {this.onSenate()}}>Your Senator is also up for re-election</Button></div>
    ]);

  }

  render() {
    return ([
      <Container>
        <Jumbotron>
          <div>{this.renderAddressBar()}</div>
          {this.renderCandidates()}
        </Jumbotron>
      </Container>
    ]);
  }
}
