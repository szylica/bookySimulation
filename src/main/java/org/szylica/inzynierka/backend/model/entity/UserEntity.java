package org.szylica.inzynierka.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.szylica.inzynierka.backend.model.utils.UserRole;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class UserEntity implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String surname;
    private String email;
    private String password;
    private String phone;

    // Pola dla biznesu
    private String companyName;
    private String NIP;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role;

    @OneToMany(mappedBy = "serviceProvider")
    private List<LocalEntity> localsProviders;

    @OneToMany(mappedBy = "customer")
    private List<VisitEntity> userVisits;

    @OneToMany(mappedBy = "worker")
    private List<VisitEntity> workerVisits;

    @OneToMany(mappedBy = "serviceProvider")
    private List<ServiceEntity> services;

    @ManyToMany(mappedBy = "workers", fetch = FetchType.LAZY)
    private List<LocalEntity> localsWorkers;



    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() {
        return this.email;
    }
}
