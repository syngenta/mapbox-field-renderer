import { Geometry } from "geojson";

interface GeoJson {
    geojson: {
      type: string;
      geometry:Geometry
    };
  }

interface CommanValue {
    id?: number;
    key?: string;
    visible?: boolean;
  }

export interface AbLine extends GeoJson, CommanValue {
    name: string;
    selected: boolean;
    gridWidth?: number;
    grid_width?: number;
  }

  
export interface BufferZone extends CommanValue {
    size: number;
    type: string;
    name?: string;
  }
  
  export interface MachineryGrid extends CommanValue {
    ABLine_id?: number;
    width: number;
    rotation?: number;
    name?: string;
  }

  export interface Plots extends GeoJson, CommanValue {
    name: string;
    rows: number;
    row_size?: number;
    columns: number;
    column_size?: number;
    plotWidth?: number;
    plotHeight?: number;
    isEditing?: boolean;
  }

  export interface Replicants extends Plots {
    parentId?: number;
  }
  
  export interface TrialPlot {
    plot: Plots;
    replicants: Replicants[];
    properties?:any;
  }

  
export interface StandardFertiliser {
    rate: number;
    fertiliser: string;
    unit_of_rate?: string;
  }

  interface BiologicalTreatment {
    treated: boolean;
}

interface Biological {
    rate: number;
    measure_unit: string;
    treatments: BiologicalTreatment[][];
}

export interface NewTrialType {
    ab_line: AbLine[];
    buffer_zone: BufferZone;
    machinery_grid: MachineryGrid;
    trial_plots: Array<{
      plot: Plots;
      replicants: Replicants[] | null;
      properties: {
        biologicals?: Biological;
        seeds: {
          measure_unit: string;
          rates_and_dosages: Array<{
            product_id: string | null;
            variety: string;
            rate: number;
          }>;
        };
        fertilisers: {
          measure_unit: string;
          rates_and_dosages: Array<{
            plot_id: number;
            rate: number;
            amount: number;
          }>;
        };
      };
    }>;
    standard_field_properties: {
      standard_fertilisers: StandardFertiliser[];
      standard_product: string;
      standard_seed_rate: number;
    };
    name: string;
    archived: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    start_date: string;
    end_date: string;
    protocol_id: string;
    assignee_id: string;
    assignee_name: string;
    org_id: string;
    property_id: string;
    field_ids: string[];
    rates_and_dosages: any; // Adjust this type if you have a specific structure
    id: string;
    protocol_name: string;
    is_exportable: boolean;
  }


export type Field = {
    created_at: string;
    updated_at: string;
    name: string;
    property_id: string;
    parent_region_id: string;
    geometry:Geometry;
    deleted: boolean;
    declared_area: number;
    tags: any[];
    reference_point?: {
      type: string;
      coordinates: number[];
    };
    calculated_area: number;
    valid_since: string | null;
    valid_until: string | null;
    id: string;
    event_date: string;
};

type Sort = {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
};

type Pageable = {
    sort: Sort;
    page_size: number;
    page_number: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
};

export type FieldsList = {
    content: Field[];
    pageable: Pageable;
    last: boolean;
    total_elements: number;
    total_pages: number;
    first: boolean;
    sort: Sort;
    number: number;
    number_of_elements: number;
    size: number;
    empty: boolean;
};