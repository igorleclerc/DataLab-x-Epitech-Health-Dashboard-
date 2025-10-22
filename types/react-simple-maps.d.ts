declare module 'react-simple-maps' {
  import { ComponentType, ReactNode } from 'react';

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: {
      scale?: number;
      center?: [number, number];
    };
    width?: number;
    height?: number;
    className?: string;
    children?: ReactNode;
  }

  export interface ZoomableGroupProps {
    children?: ReactNode;
  }

  export interface GeographiesProps {
    geography: string;
    children: (props: { geographies: any[] }) => ReactNode;
  }

  export interface GeographyProps {
    key?: string;
    geography: any;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: {
      default?: any;
      hover?: any;
      pressed?: any;
    };
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: () => void;
    onClick?: () => void;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
}