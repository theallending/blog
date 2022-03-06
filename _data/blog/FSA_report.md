---
template: BlogPost
path: /FSA_report
date: 2022-01-10T10:00:50.137Z
title: Calculating Distances Between Forward Sortation Areas
thumbnail: ''
metaDescription: example
---

# Background

Statistics Canada recently partnered with two major credit card companies and received aggregated credit card (CC) spending data with the goal of using the data to improve the National Travel Survey (NTS) spending estimates and to reduce burden on Canadians. The data captures aggregated spending and transactions made by Canadian residents in Canada. The CC data is aggregated mainly by month of transaction, grouped merchant category code, merchant forward sortation area (FSA), and customer FSA. However, the CC data includes transactions that are not considered tourism-related and must be filtered out in order to be incorporated with the NTS. In order to be considered a trip, Statistics Canada requires that the destination must be at least 40 kilometers away from the origin. This document shows how to calculate the distances between FSAs using the publicly available Statistics Canada [2016 Census Forward Sortation Area Boundary File](https://www150.statcan.gc.ca/n1/pub/92-179-g/92-179-g2016001-eng.htm).

# Data Sources

The Statistics Canada [2016 Census Forward Sortation Area Boundary File](https://www150.statcan.gc.ca/n1/pub/92-179-g/92-179-g2016001-eng.htm) depicts the boundaries of 1620 FSAs derived from the postal codes captured by the 2016 Census and provides a framework for mapping and spatial analysis. The file is available as a shapefile in the ArcGIS\textregistered \ format, which contains the latitude and longitudinal coordinates of all of the FSA boundaries. 

# Method

The entirety of this analysis was completed using R, as it allows for both straightforward geographical file import using the package *sf* and clear data visualizations using the packages *ggplot2* and *ggspatial*. The source code used to generate the data and to create visualizations is located in the appendix.

The ArcGIS\textregistered \ shapefile was read into R and explored visually. The following is a map of all Canadian FSAs created entirely with the data in the shapefile. The boundaries of the FSAs are represented in geographic coordinates projected onto a 2-dimensional cartographic representation. The cartographic boundaries of each FSA is outlined in gray.

```PHP
require(sf)
require(raster)
require(ggplot2)
require(ggspatial)
require(dplyr)
```

```PHP
x <- st_read("D:/Datasets/FSA/lfsa000b16a_e.shp")

x_cent <- st_centroid(x)

```


```JS
ggplot() + 
  geom_sf(data = x, fill = 'linen') + 
  theme_bw() + 
  ggtitle("Figure 1: Forward Sortation Areas (FSAs) in Canada") +
  theme(panel.background = element_rect(fill = "skyblue"),
        plot.title = element_text(hjust = 0.5,
                                  size = 18)) +
  annotation_scale(location = "bl") +
  annotation_north_arrow(location = "bl",
                         which_north = "true",
                         style = north_arrow_fancy_orienteering,
                         pad_x = unit(0.72, "in"),
                         pad_y = unit(0.3, "in"),
                         height = unit(1.2, "cm"),
                         width = unit(1.2, "cm"))
```

In addition to geographical coordinates, the ArcGIS\textregistered \ shapefile converts the latitude and longitude into distances (in meters) which can be represented with a Cartesian coordinate system. Therefore, the distances between FSA boundaries can easily be calculated. However, there needs to be a standardized definition of the distance between two FSAs, as using the closest borders between two FSAs will change depending on the shapes and relative locations of the FSAs. One solution is to use the geometric center (or centroid) of each FSA as the corresponding reference point to which distances will be calculated.

## Finding the Geometric Center (Centroid) of an FSA

The [centroid](https://en.wikipedia.org/wiki/Centroid) is the arithmetic mean position of all of the points in all of the coordinate directions. Using the centroid allows for a defined reference point that represents the center of an FSA. In the package *sf*, the function *st_centroid()* computes the centroid for each of the 1620 Canadian FSAs, represented in Cartesian coordinates.

The Cartesian coordinates (in meters) of the centroids are stored and can be layered onto the map plot for visualization. Figure 2 shows the FSAs in the city of Toronto with the corresponding centroids represented as blue dots.

```PHP
ontario <- x[x$PRNAME == "Ontario",]
ontario_cent <- x_cent[x_cent$PRNAME == "Ontario",]

#TORONTO
ggplot() + 
  geom_sf(data = ontario, fill = "linen") + 
  geom_sf(data = ontario_cent, color = "blue") + 
  coord_sf(xlim = c(7217000, 7234000), ylim = c(921500,938500)) + 
  labs(title = "Figure 2: Forward Sortation Areas (FSA's) with Centroids in the Toronto Area",
       caption = "Note: blue dots represent the geometric center of each FSA") +
  theme_bw() +
  theme(plot.title = element_text(hjust = 0.5,
                                  size = 18),
        panel.background = element_rect(fill = "skyblue"),
        plot.caption = element_text(hjust = 0,
                                    size = 12)) +
  annotation_scale(location = "br") +
  annotation_north_arrow(location = "br", 
                         which_north = "true",
                         pad_x = unit(0.835, "in"), 
                         pad_y = unit(0.3, "in"),
                         style = north_arrow_fancy_orienteering)
```

## Calculating the Distance Between the Centroids

```PHP
#extract coordinates into separate X and Y columns
merchant_FSA <- mutate(x_cent,
                    x_coord = st_coordinates(x_cent[,4])[,1],
                    y_coord = st_coordinates(x_cent[,4])[,2])
merchant_FSA$CFSAUID <- as.character(merchant_FSA$CFSAUID)
st_geometry(merchant_FSA) <- NULL

customer_FSA <- merchant_FSA
customer_FSA$CFSAUID <- as.character(customer_FSA$CFSAUID)

#create an example dataset with FSA: M5J as the customer FSA
ref_customer_FSA <- customer_FSA[customer_FSA$CFSAUID == "M5J",] %>% 
  slice(rep(1:n(), each = nrow(customer_FSA)))

combined_FSA <- bind_cols(ref_customer_FSA, merchant_FSA)

combined_FSA <- mutate(combined_FSA,
                       distance = sqrt((x_coord - x_coord1)^2 + (y_coord - y_coord1)^2))

#select rows where distance is greater than 40km.
tourism_FSA <- filter(combined_FSA,
                      distance > 40000)
non_tourism_FSA <- filter(combined_FSA,
                          distance <= 40000)
```

The longitude and latitude coordinates are converted into distance (in meters) from their respective standardized meridians (i.e. reference lines). The customer FSA (origin) has coordinates $p_1 = (x_1, y_1)$ and the merchant FSA (destination) has coordinates $p_2 = (x_2, y_2)$. The coordinates are manipulated into separate columns within the data frame and used in the equation for euclidean distance. 

$$d(p_1, p_2) = \sqrt{(x_1 - x_2)^2 + (y_1 - y_2)^2}$$

The distances between the customer FSA and all of the merchant FSAs are calculated and stored as a new column in the data frame.

As an example, Table 1 shows the FSA *M5J* (downtown Toronto) as the customer FSA and 15 merchant FSAs that are *within* 40 kilometers, thus transactions that fall into these combinations of FSAs are not considered as travel. Table 2 shows the opposite; 15 merchant FSAs that are *greater* than 40 kilometers away from the customer FSA. Transactions that fall into these combinations of FSAs are considered as travel.

```PHP
require(knitr)
require(kableExtra)
require(stringr)
non_tourism_example <- select(non_tourism_FSA,
                              CFSAUID,
                              PRNAME,
                              x_coord,
                              y_coord,
                              CFSAUID1,
                              PRNAME1,
                              x_coord1,
                              y_coord1,
                              distance)
non_tourism_example <- filter(non_tourism_example,
                              CFSAUID != CFSAUID1)

tourism_example <- select(tourism_FSA,
                              CFSAUID,
                              PRNAME,
                              x_coord,
                              y_coord,
                              CFSAUID1,
                              PRNAME1,
                              x_coord1,
                              y_coord1,
                              distance)
tourism_example <- filter(tourism_example,
                              CFSAUID != CFSAUID1)

non_tourism_example$distance <- round((non_tourism_example$distance / 1000),2)
non_tourism_example <- mutate(non_tourism_example,
                          PRNAME = as.factor(word(PRNAME, end = 1,sep = fixed(" /"))),
                          PRNAME1 = as.factor(word(PRNAME1, end = 1,sep = fixed(" /"))))
tourism_example$distance <- round((tourism_example$distance / 1000),2)
tourism_example <- mutate(tourism_example,
                          PRNAME = as.factor(word(PRNAME, end = 1,sep = fixed(" /"))),
                          PRNAME1 = as.factor(word(PRNAME1, end = 1,sep = fixed(" /"))))



kable(arrange(non_tourism_example, distance)[1:15,],
      "latex",
      booktabs = T,
      caption = paste("Non-Tourism FSAs from M5J - Downtown Toronto (15 out of ", 
                      nrow(non_tourism_example),
                      ")"),
      col.names = c("FSA",
                    "Province",
                    "x (m)",
                    "y (m)",
                    "FSA",
                    "Province",
                    "x (m)",
                    "y (m)",
                    "Distance (km.)")) %>%
  add_header_above(c("Customer" = 4, "Merchant" = 4, " "), bold = T) %>%
  kable_styling(latex_options = c("striped", "hold_position", "scale_down")) %>%
  row_spec(0, bold = T)

kable(arrange(tourism_example, desc(distance))[1:15,],
      "latex",
      booktabs = T,
      caption = paste0("Tourism FSAs from M5J - Downtown Toronto (15 out of ",
                       nrow(tourism_example),
                       ")"),
      col.names = c("FSA",
                    "Province",
                    "x (m)",
                    "y (m)",
                    "FSA",
                    "Province",
                    "x (m)",
                    "y (m)",
                    "Distance (km.)")) %>%
  add_header_above(c("Customer" = 4, "Merchant" = 4, " "), bold = T) %>%
  kable_styling(latex_options = c("striped", "hold_position", "scale_down")) %>%
  row_spec(0, bold = T)

```

This process can easily be repeated for any customer FSA. Furthermore, a mapping file can be generated that lists all merchant FSAs which are greater than 40 kilometers away from each of the customer FSAs. The resulting file can be used when processing the domestic credit card data in order to filter out transactions that are not considered as tourism.

# Limitations

While it is clear that the 2016 Census Boundary File allows for a simple calculation of the distances between FSAs, there are limitations with using it in the context of credit card data. The impact that these limitations have should be evaluated before using the 2016 Census Boundary File as a part of any production process.

## Census FSAs vs. Canada Post FSAs

The FSAs in the Boundary File are those reported by census respondents, based on the most frequently reported FSA for a given dissemination area. If there are no responses in a dissemination area, it is assigned an FSA based on the proximity to the nearest reported dissemination area in the same province or territory. This can lead to Census FSAs differing in shape from Canada Post FSAs. 

Furthermore, a reported FSA may not be represented in the file if it was not the most frequently reported FSA in the dissemination area. This means that there could be FSAs in the credit card data that do not appear in the Census FSA Boundary File.

**Recommendation**: Evaluate the accuracy of the Census FSAs with respect to the FSAs found in the credit card data. Quantify the number of FSAs in the credit card data that do not exist in the Census FSA data. If there are a significant number of discrepancies, it may be necessary to obtain Canada Post FSA Boundary information, rather than use Census FSA information.

## Geographic Accuracy

The distances between the centroids are based off of the accuracy of the FSA boundaries. There may be some mapping distortion from the conical projection which could affect the distances. In theory, the farther the distance between FSAs, the less it is impacted by distortion, and the more accurate it should be.

Empirically, when referencing Google Maps, the calculated distances are very similar. Since Google Maps seems to use Canada Post FSAs, the location of the centroids are different, which leads to the small discrepancies that we see. The discrepancies in distance due to the differing FSA boundaries between Census and Canada Post should explain the majority of the discrepancy that we see. Meanwhile, the discrepancies due to geographic distortion from the conical projection should be relatively small.

```PHP
col1 <- rep("M5J", 6)
col2 <- c("Y0B", "V9H", "S4R", "J7T", "L1Y", "M5E")
col3 <- c(4171.57, 3551.15, 2061.92, 469.80, 41.84, 2.13)
col4 <- c(4169.58, 3502.34, 2046.41, 460.25, 43.51, 2.17)

acc_df <- data.frame(col1, col2, col3, col4)

kable(acc_df, 
      "latex", 
      booktabs = T,
      col.names = c("Customer FSA", 
                    "Merchant FSA", 
                    "Calculated Distance (km.)", 
                    "Google Maps Distance (km.)"),
      linesep = "") %>%
  kable_styling(latex_options = c("striped", "hold_position")) %>%
  row_spec(0, bold = T) %>%
  column_spec(3:4, width = "3cm") %>%
  column_spec(1:2, width = "2cm")
```

**Recommendation**: For incorporating credit card data with the NTS, it appears that very precise distance calculations are not required, as the only distance criteria for a transaction to be considered a trip is that it is at least 40 kilometers away. This means that the impact of distortion on the calculated distances should not impact the number of tourism and non-tourism FSAs. It is more important to evaluate the discrepancies in distance due to the differences in Census FSAs and Canada Post FSAs, and if necessary, obtain Canada Post FSA data.

\newpage

## Population Density Inside FSA

Even though calculating the geometric center of an FSA is the logical step to take before calculating the distance between two FSAs, it may not line up with the most populous region inside that FSA, and thus may not line up with tourism spending "hotspots".

For example, figure 3 shows the FSA M5J and its irregular shape. The geometric center of this FSA does not align with downtown Toronto, which would have the highest amounts of tourism-related spending.

```PHP
m5j <- ontario[ontario$CFSAUID == "M5J",]
notm5j <- ontario[ontario$CFSAUID != "M5J",]
m5j_cent <- ontario_cent[ontario_cent$CFSAUID == "M5J",]

ggplot() + 
  geom_sf(data = m5j, fill = "linen") + 
  geom_sf(data = notm5j, fill = "grey") +
  geom_sf(data = m5j_cent, color = "blue") + 
  coord_sf(xlim = c(7220000, 7231000), ylim = c(921500,932500)) + 
  labs(title = "Figure 3: Location of Centroid in FSA M5J - Downtown Toronto") +
  theme_bw() +
  theme(plot.title = element_text(hjust = 0.5,
                                  size = 15),
        panel.background = element_rect(fill = "skyblue"),
        plot.caption = element_text(hjust = 0,
                                    size = 12)) +
  annotation_scale(location = "br") +
  annotation_north_arrow(location = "br", 
                         which_north = "true",
                         pad_x = unit(0.4, "in"), 
                         pad_y = unit(0.3, "in"),
                         style = north_arrow_fancy_orienteering)
```

This only impacts FSAs that are close to the 40 kilometer threshold. For example, an FSA with its centroid could be 39.5 kilometers away from the origin, but the most populous region of the FSA could be farther at 40.5 kilometers away. The extent to which this scenario occurs is currently unknown, but should be explored further. 

In the event that this scenario occurs at a significant rate, an alternative approach is using the Statistics Canada [2016 Population Centres Boundary File](https://www150.statcan.gc.ca/n1/en/catalogue/92-166-X). It contains the population centre boundaries for which census data are disseminated. The centroids of the population centre boundaries could be used to replace some of the existing FSA centroids. However, this approach requires further exploration.

**Recommendation**: Evaluate the extent as to how many FSAs are near the 40 kilometer threshold and how much impact it would have on spending estimates. If the impact is indeed significant, explore alternative approaches such as using the population centre boundaries file to calculate distances between FSAs.

# Using Census Metropolitan Areas (CMA's) - NEW

```PHP
CMA <- st_read("D:/Datasets/CMA/lcma000b16a_e.shp")
PROV <- st_read("D:/Datasets/PROV/lpr_000b16a_e.shp")

fsa_tourism_region <- read.csv("fsa_tourism_region_grouping.csv")
fsa_tourism_region$Tourism <- as.factor(fsa_tourism_region$Tourism)
```

```PHP
library(RColorBrewer)

# ggplot() +
#   geom_sf(data = PROV, fill = "linen") +
#   geom_sf(data = CMA, fill = "lightgreen") +
#   theme(panel.background = element_rect(fill = "skyblue"),
#         plot.title = element_text(hjust = 0.5,
#                                   size = 18))

PROV_filter <- filter(PROV, PRUID == "35")
CMA_filter <- filter(CMA, PRUID == "35")
FSA_filter <- filter(x, PRUID == "35")

FSA_filter <- left_join(FSA_filter, fsa_tourism_region, by = c("CFSAUID" = "FSA"))


# ggplot() +
#   geom_sf(data = FSA_filter, fill = "linen") +
#   geom_sf(data = CMA_filter, fill = alpha("red", 0.2), line = "red", linetype = "dashed") +
#   theme(panel.background = element_rect(fill = "skyblue"),
#         plot.title = element_text(hjust = 0.5,
#                                   size = 18))
# 
nb.cols <- length(unique(FSA_filter$Tourism))
mycolors = colorRampPalette(brewer.pal(8, "Accent"))(nb.cols)
ggplot() +
  geom_sf(data = FSA_filter,aes(fill = Tourism)) +
  scale_fill_manual(values = mycolors) + 
  theme(panel.background = element_rect(fill = "skyblue"),
      plot.title = element_text(hjust = 0.5,
                                size = 18)) +
  labs(title = paste0("Forward Sortation Areas (FSAs) Grouped by Tourism Region - ",
                      unique(FSA_filter$PRNAME)))

# ggplot() +
#   geom_sf(data = PROV_filter, fill = "linen") +
#   geom_sf(data = CMA_filter, fill = CMA_filter$CMAUID) +
#   theme(panel.background = element_rect(fill = "skyblue"),
#         plot.title = element_text(hjust = 0.5,
#                                   size = 18))
```


# Conclusion

This document gives a starting point for calculating distances between FSAs, in order for the domestic credit card data to be implemented into the NTS. It shows that by simply using existing Statistics Canada Boundary files, fairly reliable distances can be calculated with a minimal amount of work. The limitations of using the Census FSA Boundary Files should be evaluated and ultimately addressed.

# Appendix

```PHP
require(sf)
require(raster)
require(ggplot2)
require(ggspatial)
require(dplyr)
require(knitr)
require(kableExtra)
require(stringr)

#read data
x <- st_read("D:/Datasets/FSA/lfsa000b16a_e.shp")
#calculate centroids and store as another data frame
x_cent <- st_centroid(x)

#map of Canada
ggplot() + 
  geom_sf(data = x, fill = 'linen') + 
  theme_bw() + 
  ggtitle("Figure 1: Forward Sortation Areas (FSAs) in Canada") +
  theme(panel.background = element_rect(fill = "skyblue"),
        plot.title = element_text(hjust = 0.5,
                                  size = 18)) +
  annotation_scale(location = "bl") +
  annotation_north_arrow(location = "bl",
                         which_north = "true",
                         style = north_arrow_fancy_orienteering,
                         pad_x = unit(0.72, "in"),
                         pad_y = unit(0.3, "in"),
                         height = unit(1.2, "cm"),
                         width = unit(1.2, "cm"))

#extract Ontario FSAs and their centroids
ontario <- x[x$PRNAME == "Ontario",]
ontario_cent <- x_cent[x_cent$PRNAME == "Ontario",]

#map of Toronto
ggplot() + 
  geom_sf(data = ontario, fill = "linen") + 
  geom_sf(data = ontario_cent, color = "blue") + 
  coord_sf(xlim = c(7217000, 7234000), ylim = c(921500,938500)) + 
  labs(title = "Figure 2: Forward Sortation Areas (FSA's) with Centroids in the Toronto Area",
       caption = "Note: blue dots represent the geometric center of each FSA") +
  theme_bw() +
  theme(plot.title = element_text(hjust = 0.5,
                                  size = 18),
        panel.background = element_rect(fill = "skyblue"),
        plot.caption = element_text(hjust = 0,
                                    size = 12)) +
  annotation_scale(location = "br") +
  annotation_north_arrow(location = "br", 
                         which_north = "true",
                         pad_x = unit(0.835, "in"), 
                         pad_y = unit(0.3, "in"),
                         style = north_arrow_fancy_orienteering)

#extract coordinates into separate X and Y columns
merchant_FSA <- mutate(x_cent,
                    x_coord = st_coordinates(x_cent[,4])[,1],
                    y_coord = st_coordinates(x_cent[,4])[,2])
merchant_FSA$CFSAUID <- as.character(merchant_FSA$CFSAUID)
st_geometry(merchant_FSA) <- NULL

customer_FSA <- merchant_FSA
customer_FSA$CFSAUID <- as.character(customer_FSA$CFSAUID)

#create an example dataset with FSA: M5J as the customer FSA
ref_customer_FSA <- customer_FSA[customer_FSA$CFSAUID == "M5J",] %>% 
  slice(rep(1:n(), each = nrow(customer_FSA)))

combined_FSA <- bind_cols(ref_customer_FSA, merchant_FSA)

combined_FSA <- mutate(combined_FSA,
                       distance = sqrt((x_coord - x_coord1)^2 + (y_coord - y_coord1)^2))

#use 40km criteria to separate into two datasets
tourism_FSA <- filter(combined_FSA,
                      distance > 40000)
non_tourism_FSA <- filter(combined_FSA,
                          distance <= 40000)

#create non-tourism example table
non_tourism_example <- select(non_tourism_FSA, CFSAUID, PRNAME, x_coord, y_coord, 
                              CFSAUID1, PRNAME1, x_coord1, y_coord1, distance)
non_tourism_example <- filter(non_tourism_example,
                              CFSAUID != CFSAUID1)

#create tourism example table
tourism_example <- select(tourism_FSA, CFSAUID, PRNAME, x_coord, y_coord,
                              CFSAUID1, PRNAME1, x_coord1, y_coord1,distance)
tourism_example <- filter(tourism_example,
                              CFSAUID != CFSAUID1)

#data cleaning and rounding
non_tourism_example$distance <- round((non_tourism_example$distance / 1000),2)
non_tourism_example <- mutate(non_tourism_example,
                          PRNAME = as.factor(word(PRNAME, end = 1,sep = fixed(" /"))),
                          PRNAME1 = as.factor(word(PRNAME1, end = 1,sep = fixed(" /"))))
tourism_example$distance <- round((tourism_example$distance / 1000),2)
tourism_example <- mutate(tourism_example,
                          PRNAME = as.factor(word(PRNAME, end = 1,sep = fixed(" /"))),
                          PRNAME1 = as.factor(word(PRNAME1, end = 1,sep = fixed(" /"))))


#table output
kable(arrange(non_tourism_example, distance)[1:15,],
      "latex",
      booktabs = T,
      caption = paste("Non-Tourism FSAs from M5J - Downtown Toronto (15 out of ", 
                      nrow(non_tourism_example),
                      ")"),
      col.names = c("FSA", "Province", "x (m)", "y (m)", "FSA",
                    "Province", "x (m)", "y (m)", "Distance (km.)")) %>%
  add_header_above(c("Customer" = 4, "Merchant" = 4, " "), bold = T) %>%
  kable_styling(latex_options = c("striped", "hold_position", "scale_down")) %>%
  row_spec(0, bold = T)

#table output
kable(arrange(tourism_example, desc(distance))[1:15,],
      "latex",
      booktabs = T,
      caption = paste0("Tourism FSAs from M5J - Downtown Toronto (15 out of ",
                       nrow(tourism_example),
                       ")"),
      col.names = c("FSA", "Province", "x (m)", "y (m)", "FSA", 
                    "Province", "x (m)", "y (m)", "Distance (km.)")) %>%
  add_header_above(c("Customer" = 4, "Merchant" = 4, " "), bold = T) %>%
  kable_styling(latex_options = c("striped", "hold_position", "scale_down")) %>%
  row_spec(0, bold = T)

#comparing calculated distances to Google Maps distances
col1 <- rep("M5J", 6)
col2 <- c("Y0B", "V9H", "S4R", "J7T", "L1Y", "M5E")
col3 <- c(4171.57, 3551.15, 2061.92, 469.80, 41.84, 2.13)
col4 <- c(4169.58, 3502.34, 2046.41, 460.25, 43.51, 2.17)

acc_df <- data.frame(col1, col2, col3, col4)

#table output
kable(acc_df, 
      "latex", 
      booktabs = T,
      col.names = c("Customer FSA", 
                    "Merchant FSA", 
                    "Calculated Distance (km.)", 
                    "Google Maps Distance (km.)"),
      linesep = "") %>%
  kable_styling(latex_options = c("striped", "hold_position")) %>%
  row_spec(0, bold = T) %>%
  column_spec(3:4, width = "3cm") %>%
  column_spec(1:2, width = "2cm")

#map of M5J - Downtown Toronto
m5j <- ontario[ontario$CFSAUID == "M5J",]
notm5j <- ontario[ontario$CFSAUID != "M5J",]
m5j_cent <- ontario_cent[ontario_cent$CFSAUID == "M5J",]

ggplot() + 
  geom_sf(data = m5j, fill = "linen") + 
  geom_sf(data = notm5j, fill = "grey") +
  geom_sf(data = m5j_cent, color = "blue") + 
  coord_sf(xlim = c(7220000, 7231000), ylim = c(921500,932500)) + 
  labs(title = "Figure 3: Location of Centroid in FSA M5J - Downtown Toronto") +
  theme_bw() +
  theme(plot.title = element_text(hjust = 0.5,
                                  size = 15),
        panel.background = element_rect(fill = "skyblue"),
        plot.caption = element_text(hjust = 0,
                                    size = 12)) +
  annotation_scale(location = "br") +
  annotation_north_arrow(location = "br", 
                         which_north = "true",
                         pad_x = unit(0.4, "in"), 
                         pad_y = unit(0.3, "in"),
                         style = north_arrow_fancy_orienteering)

```

```PHP
merchant_FSA <- mutate(merchant_FSA, dummy = rep(1, nrow(merchant_FSA)))
customer_FSA <- mutate(customer_FSA, dummy = rep(1, nrow(customer_FSA)))

all_FSA <- inner_join(merchant_FSA, customer_FSA, by = "dummy")
all_FSA <- filter(all_FSA, CFSAUID.x != CFSAUID.y)
all_FSA <- mutate(all_FSA,
                  distance_km = round((sqrt((x_coord.x - x_coord.y)^2 + (y_coord.x - y_coord.y)^2))/1000,2))
all_FSA <- rename(all_FSA,
                  merchant_FSA = CFSAUID.x,
                  customer_FSA = CFSAUID.y,
                  x_merch = x_coord.x,
                  y_merch = y_coord.x,
                  x_cust = x_coord.y,
                  y_cust = y_coord.y,
                  merchant_PROVID = PRUID.x,
                  customer_PROVID = PRUID.y,
                  merchant_PROV = PRNAME.x,
                  customer_PROV = PRNAME.y)

all_FSA <- select(all_FSA, -dummy, -x_merch, -y_merch, -x_cust, -y_cust)
all_nontourism_FSA <- filter(all_FSA, distance_km <= 40)
write.csv(all_FSA, file = "all_FSA_distances.csv", row.names = FALSE)
```