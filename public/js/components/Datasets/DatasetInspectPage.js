import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { pushState } from 'redux-react-router';
import { fetchDataset, fetchDatasetsIfNeeded } from '../../actions/DatasetActions';
import { fetchFieldPropertiesIfNeeded } from '../../actions/FieldPropertiesActions';

import styles from './Datasets.sass';

import HeaderBar from '../Base/HeaderBar';
import RaisedButton from '../Base/RaisedButton';
import DropDownMenu from '../Base/DropDownMenu';
import DatasetDataGrid from './DatasetDataGrid';
import DatasetRow from './DatasetRow';
import ReduceColumnsModal from './ReduceColumnsModal';
import PivotModal from './PivotModal';
import MergeDatasetsModal from './MergeDatasetsModal';

export class DatasetInspectPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reduceColumnsModalOpen: false,
      pivotModalOpen: false,
      mergeDatasetsModalOpen: false
    }

    this.onSelectDataset = this.onSelectDataset.bind(this);
    this.onClickUploadDataset = this.onClickUploadDataset.bind(this);
    this.onClickDeleteDataset = this.onClickDeleteDataset.bind(this);
  }

  componentWillMount() {
    const { project, datasets, params, fetchDataset, fetchDatasetsIfNeeded, fetchFieldPropertiesIfNeeded } = this.props;
    fetchDataset(params.projectId, params.datasetId);
    fetchFieldPropertiesIfNeeded(params.projectId, params.datasetId);

    if (project.properties.id && !datasets.fetchedAll && !datasets.isFetching) {
      fetchDatasetsIfNeeded(projectId, false);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { project, params, datasetSelector, datasets, fetchDataset, fetchDatasetsIfNeeded, fetchFieldPropertiesIfNeeded, pushState } = nextProps;
    if (project.properties.id !== this.props.project.properties.id || (!datasets.fetchedAll && !datasets.isFetching)) {
      fetchDatasetsIfNeeded(project.properties.id, false);
    }

    if (params.projectId !== this.props.params.projectId || params.datasetId !== this.props.params.datasetId) {
      fetchDataset(params.projectId, params.datasetId);
      fetchFieldPropertiesIfNeeded(params.projectId, params.datasetId);
    }

    if (datasetSelector.datasetId != this.props.datasetSelector.datasetId) {
      pushState(null, `/projects/${ this.props.params.projectId }/datasets/${ datasetSelector.datasetId }/inspect`);
    }
  }

  openMergeDatasetsModal() {
    this.setState({ mergeDatasetsModalOpen: true });
  }

  closeMergeDatasetsModal() {
    this.setState({ mergeDatasetsModalOpen: false });
  }

  openPivotModal() {
    this.setState({ pivotModalOpen: true });
  }

  closePivotModal() {
    this.setState({ pivotModalOpen: false });
  }

  openColumnReductionModal() {
    this.setState({ reduceColumnsModalOpen: true });
  }

  closeColumnReductionModal() {
    this.setState({ reduceColumnsModalOpen: false });
  }

  onSelectDataset(selectedValue) {
    if (selectedValue) {
      this.props.pushState(null, `/projects/${ this.props.projectId }/datasets/${ selectedValue }/inspect`);
    }
  }

  onClickDeleteDataset() {
    const { deleteDataset, datasetSelector, projectId } = this.props;

    deleteDataset(projectId, datasetSelector.datasetId);
  }

  onClickUploadDataset() {
    const projectId = this.props.projectId;
    this.props.pushState(null, `/projects/${ projectId }/datasets/upload`);
  }

  render() {
    const { datasets, datasetSelector, fieldProperties, params, project } = this.props;
    const dataset = datasets.items.filter((dataset) =>
      dataset.datasetId == params.datasetId
    )[0];

    return (
      <div className={ styles.fillContainer + ' ' + styles.datasetContainer }>
        <HeaderBar
          header="Inspect"
          actions={
            <div className={ styles.headerControlRow }>
              <div className={ styles.headerControl }>
                <RaisedButton icon={ true } onClick={ this.onClickDeleteDataset }>
                  <i className="fa fa-trash"></i>
                </RaisedButton>
              </div>
              <div className={ styles.headerControl }>
                <RaisedButton label="Reduce columns" onClick={ this.openColumnReductionModal.bind(this) }/>
              </div>
              <div className={ styles.headerControl }>
                <RaisedButton label="Pivot" onClick={ this.openPivotModal.bind(this) }/>
              </div>
              <div className={ styles.headerControl }>
                <RaisedButton label="Combine datasets" onClick={ this.openMergeDatasetsModal.bind(this) }/>
              </div>
              <div className={ styles.headerControl }>
                <RaisedButton label="Upload new dataset" onClick={ this.onClickUploadDataset } />
              </div>
              <div className={ styles.headerControl + ' ' + styles.datasetSelectorControl }>
                <span>Dataset </span>
                <DropDownMenu
                  className={ styles.datasetSelector }
                  value={ parseInt(datasetSelector.datasetId) }
                  options={ datasets.items.length > 0 ? datasets.items : [] }
                  valueMember="datasetId"
                  displayTextMember="title"
                  onChange={ this.onSelectDataset } />
              </div>
            </div>            
          }
        />

        { dataset && dataset.details &&
          <DatasetDataGrid dataset={ dataset } fieldProperties={ fieldProperties }/>
        }
        { dataset && dataset.details && this.state.reduceColumnsModalOpen &&
          <ReduceColumnsModal
            projectId={ params.projectId }
            datasetId={ params.datasetId }
            closeAction={ this.closeColumnReductionModal.bind(this) }
            columnNames={ dataset.details.fieldNames }/>
        }
        { dataset && dataset.details && this.state.mergeDatasetsModalOpen &&
          <MergeDatasetsModal
            projectId={ params.projectId }
            datasetId={ params.datasetId }
            datasets={ datasets.items }
            closeAction={ this.closeMergeDatasetsModal.bind(this) }
            columnNames={ dataset.details.fieldNames }/>
        }
        { dataset && dataset.details && this.state.pivotModalOpen &&
          <PivotModal
            projectId={ params.projectId }
            datasetId={ params.datasetId }
            closeAction={ this.closePivotModal.bind(this) }
            columnNames={ dataset.details.fieldNames }/>
        }
        { this.props.children }
      </div>
    );
  }
}

DatasetInspectPage.propTypes = {
  project: PropTypes.object.isRequired,
  datasets: PropTypes.object.isRequired,
  fieldProperties: PropTypes.object.isRequired,
  children: PropTypes.node
};


function mapStateToProps(state) {
  const { project, datasets, datasetSelector, fieldProperties } = state;
  return { project, datasets, datasetSelector, fieldProperties };
}

export default connect(mapStateToProps, {
  fetchDataset,
  fetchDatasetsIfNeeded,
  fetchFieldPropertiesIfNeeded,
  pushState
})(DatasetInspectPage);
