---
template: BlogPost
path: /Formula1_RacePace_FastF1
date: 2022-01-27T09:35:36.571Z
title: "Formula 1: Using the FastF1 Python API to visualize race pace"
thumbnail: /assets/lewis.jpg
---

# <u> Introduction </u>

The [FastF1 Python API](https://github.com/theOehrly/Fast-F1) is a simple way to get access to F1 lap times, car telemetry and position, tyre data, weather data, and weekend information. This blog post will go through how to import race timing data for the 2021 Abu Dhabi Grand Prix using Python, and show some simple visualizations for race pace using R and ggplot2.

# <u> Formula 1 Concepts </u> 

### Race Pace

Race pace is defined as, on average, how fast a Formula 1 car can complete a lap during a Grand Prix. A faster race pace in one Formula 1 car usually results in a higher finishing position than a car with a slower race pace. 

### Tyre Compound

Tyres are the only point of contact that a Formula 1 car has with the asphalt, so tyre characteristics greatly affect the performance of the car. A tyre that has softer rubber has more grip on the asphalt, allowing the car to carry more speed in the corners and accelerate faster. However, softer rubber degrades faster, leading to a shorter effective lifespan of the tyre.

Since 2019, there are three possible dry-condition tyre compounds available during a race. 


### Fuel Level

Refueling an F1 car mid-race has been banned since 2010 in order to increase safety and reduce costs. This means that F1 cars must start with enough gas to ensure that the car can last the entire race. The added fuel and resulting burnoff means that F1 cars get lighter as the race progresses. Lighter cars means quicker acceleration and de-acceleration, resulting in faster laptimes. 

### Clean vs. Dirty Air

Formula 1 cars are incredibly efficient at producing downforce from the complex aerodynamic systems of the cars. However, downforce is dramatically reduced in the presence of turbulent (dirty) air, which is left behind in the wake of each car. This means that following closely to the car in front during cornering reduces how fast the car can go, even if the following car is physically faster. In contrast, following closely to the car in front during a straight will dramatically increase the following car's speed. This is called the slipstream effect.


<div class="video-container">
    <iframe src="https://www.youtube.com/embed/nivswe7Zyuc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

<br/>

### Track Conditions

Due to the sensitive aerodynamic and mechanical nature of Formula 1 cars, laptimes are directly affected by wind speed and direction, precipitation, asphalt temperature, and track cautions due to crashes or debris. Changes in any of these factors will directly influence laptimes, so it's imperative that they are taken into account during analysis.

# <u> Using the FastF1 API </u> 


```python
import fastf1 as ff1
from fastf1 import plotting

# Load the session data
race = ff1.get_session(2021, 'Abu Dhabi', 'R').get_race

# Extract data for each lap
laps = race.load_laps()

# Convert laptimes to seconds
laps['LapTimeSeconds'] = laps['LapTime'].dt.total_seconds()

# To get accurate laps only, we exclude in/out laps
laps = laps.loc[(laps['PitOutTime'].isnull() & laps['PitInTime'].isnull())]
```
<br/>

# <u> Data Preparation </u> 

# <u> Data Visualization </u> 

Of all the many ways to effectively visualize race pace distribution; the simplest has to be the boxplot. The boxplot visually shows enough information to infer some sort of spread to the data. A boxplot shows the median, interquartile range, maximum/minimum, and the presence of outliers. Let's start by plotting the lap times by driver using the base R function <i>boxplot</i>().

### Boxplot (base R)

```r
# Plot lap time by driver
boxplot(f1$LapTimeSeconds ~ f1$Driver, 
		ylab = "Lap Time (sec.)", 
		xlab = "Driver", 
		main = "2021 Abu Dhabi GP: Race Pace Distribution \n Safety Car, Yellow Flags, and In/Out Laps Removed")
```

<br/>

![](/assets/boxplot_baseR.png)

This boxplot shows the distribution of laptimes by driver. The black line represents the median laptime, the grey-shaded area represents the interquartile range, where 75% of the data points lie, and the points outside the boxplot arms represent the outliers. A smaller grey box represents more consistent laptimes, while a smaller median value represents that the car was, over the entire race, faster than another car with a higher median value. It's easy to see how Lewis Hamilton and Max Verstappen, the two title challengers, were in the fastest cars with Hamilton also having the most consistent laptimes.


### Boxplot (ggplot2)

Using ggplot2 allows for aesthetic boxplot visualizations.  We can adjust the plot to make it easier to extract important information:

- We can start off by ordering the drivers by median laptime
- We can color the boxplots by official F1 team colors. This allows us to easily see how a team is performing relative to other teams.

```JS
ggplot(data = f1) + 
geom_boxplot(aes(y = reorder(Driver, -LapTimeSeconds, na.rm = T, FUN = median), x = LapTimeSeconds, fill = Team), 
             size = 1, color = "black") + 
theme_bw() +
ggtitle("2021 Abu Dhabi GP:  Race Pace Distribution", subtitle =  "Safety Car, Yellow Flags, and In/Out Laps Removed") +
ylab("Driver") +
xlab("Lap Time (sec.)") +
scale_fill_manual(breaks = levels(as.factor(f1$Team)), 
				  values =  c("#900000", "#2B4562", "#0090FF", "#006F62", "#DC0000", "lightgrey", "#FF8700", 
				  			  "#00D2BE", "#0600EF", "#005AFF" ))  +
scale_x_continuous(breaks = scales::pretty_breaks(n = 10)) +
theme(plot.title = element_text(hjust = 0.5, size = 22),
      plot.subtitle = element_text(hjust = 0.5, size = 18),
      axis.ticks.y = element_blank(),
      axis.title.x = element_text(size = 18),
      axis.title.y = element_text(size = 18, angle = 0., vjust = 0.5),
      axis.text = element_text(size = 16),
      legend.key.size = unit(1, 'cm'),
      legend.title = element_text(size = 18),
      legend.text = element_text(size = 18),
      panel.border = element_rect(size = 2)) 
```

<br/>

![](/assets/AbuDhabi_BoxPlot_NoTyre.png)

<br/>


### Distribution of Laptimes (Ridgeline Plot)

```JS
ggplot(data = f1) + 
theme_bw() +
geom_density_ridges(aes(y = reorder(Driver, -LapTimeSeconds, na.rm = T, FUN = median), x = LapTimeSeconds, fill = Team), 
					scale = 1.5, color = NA , rel_min_height = 0.01) +
scale_fill_manual(breaks = levels(as.factor(f1$Team)), 
				  values =  c("#900000", "#2B4562", "#0090FF", "#006F62", "#DC0000", "lightgrey", 
							  "#FF8700", "#00D2BE", "#0600EF", "#005AFF" ))  +
scale_color_manual(breaks = levels(f1$Compound), values = c("white", "yellow", "red"), labels = c("Hard", "Medium", "Soft")) +
ylab("Driver") +
xlab("Lap Time (sec.)") +
ggtitle("2021 Abu Dhabi GP: Race Pace Distribution" ,subtitle =  "Safety Car, Yellow Flags, and In/Out Laps Removed") +
theme(plot.title = element_text(hjust = 0.5, size = 22),
    plot.subtitle = element_text(hjust = 0.5, size = 18),
    axis.ticks.y = element_blank(),
    axis.title.x = element_text(size = 18),
    axis.title.y = element_text(size = 18, angle = 0., vjust = 0.5),
    axis.text = element_text(size = 16),
    axis.text.y = element_text(vjust = 0),
    legend.key.size = unit(1, 'cm'),
    legend.title = element_text(size = 18),
    legend.text = element_text(size = 18),
    panel.border = element_rect(size = 2)) + 
scale_y_discrete(expand = expand_scale(add = c(0.2, 1.5))) +
scale_x_continuous(breaks = scales::pretty_breaks(n = 10)) 
```
<br/>

![](/assets/AbuDhabi_RidgePlot_NoTyre.png)

### 

# <u> Data Analysis </u> 


